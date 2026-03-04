import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getUserById } from "@/lib/db";
import type { Donation } from "@/lib/types";
import { createDonationSchema } from "@/lib/validation";
import { checkRateLimit, donationRateLimiter } from "@/lib/rate-limit";
import { sendEmail, EmailTemplates } from "@/lib/email";
import { logError, logInfo, logAudit } from "@/lib/logger";
import DOMPurify from "isomorphic-dompurify";

const DB_NAME = process.env.MONGODB_DB_NAME || "foodbridge";

export async function POST(request: NextRequest) {
	try {
		// Get user session
		const session = await getSession();

		if (!session) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 },
			);
		}

		// Rate limiting per user
		const rateLimit = await checkRateLimit(
			`donation:${session.id}`,
			donationRateLimiter,
			10,
			3600000,
		);

		if (!rateLimit.success) {
			return NextResponse.json(
				{ error: "Too many donations posted. Please try again later." },
				{ status: 429 },
			);
		}

		// Get user data
		const user = await getUserById(session.id);

		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 },
			);
		}

		// Only donors can create donations
		if (user.role !== "donor") {
			return NextResponse.json(
				{ error: "Only donors can create donations" },
				{ status: 403 },
			);
		}

		// Parse request body
		const body = await request.json();

		// Validate with Zod
		const validation = createDonationSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ error: validation.error.errors[0].message },
				{ status: 400 },
			);
		}

		const {
			title,
			description,
			quantity,
			expiry,
			location,
			coordinates,
			imageUrl,
			imageHint,
		} = validation.data;

		// Sanitize text inputs
		const sanitizedTitle = DOMPurify.sanitize(title);
		const sanitizedDescription = DOMPurify.sanitize(description);
		const sanitizedQuantity = DOMPurify.sanitize(quantity);

		// Create donation object
		const donation: Omit<Donation, "id"> = {
			title: sanitizedTitle,
			description: sanitizedDescription,
			quantity: sanitizedQuantity,
			status: "available",
			expiry: new Date(expiry),
			createdAt: new Date(),
			donor: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				avatarUrl: user.avatarUrl,
				createdAt: user.createdAt,
			},
			location: {
				address: location || "",
				lat: coordinates.lat,
				lng: coordinates.lng,
			},
			imageUrl:
				imageUrl || "https://placehold.co/800x450/jpg?text=Donation",
			imageHint: imageHint || "Donation",
		};

		// Insert into database
		const db = await getDb(DB_NAME);
		const result = await db.collection("donations").insertOne(donation);

		// Send confirmation email
		await sendEmail({
			to: user.email,
			...EmailTemplates.donationPosted(user.name, sanitizedTitle),
		});

		// Audit log
		logAudit("DONATION_CREATED", user.id, {
			donationId: result.insertedId.toString(),
			title: sanitizedTitle,
		});
		logInfo("Donation created", {
			userId: user.id,
			donationId: result.insertedId.toString(),
		});

		return NextResponse.json(
			{
				message: "Donation created successfully",
				id: result.insertedId.toString(),
			},
			{ status: 201 },
		);
	} catch (error) {
		logError("Error creating donation", error);
		return NextResponse.json(
			{ error: "Failed to create donation" },
			{ status: 500 },
		);
	}
}
