import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getUserById } from "@/lib/db";
import type { Donation } from "@/lib/types";

const DB_NAME = process.env.MONGODB_DB_NAME || "foodbridge";

export async function POST(request: NextRequest) {
	try {
		// Get user session
		const session = await getSession();

		if (!session) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Get user data
		const user = await getUserById(session.id);

		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		// Only donors can create donations
		if (user.role !== "donor") {
			return NextResponse.json(
				{ error: "Only donors can create donations" },
				{ status: 403 }
			);
		}

		// Parse request body
		const body = await request.json();
		const { title, description, quantity, expiry, location, coordinates } =
			body;

		// Validate required fields (coordinates required, address optional)
		if (
			!title ||
			!description ||
			!quantity ||
			!expiry ||
			!coordinates ||
			typeof coordinates.lat !== "number" ||
			typeof coordinates.lng !== "number"
		) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Create donation object
		const donation: Omit<Donation, "id"> = {
			title,
			description,
			quantity,
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
				body.imageUrl ||
				"https://placehold.co/800x450/jpg?text=Donation",
			imageHint: body.imageHint || "Donation",
		};

		// Insert into database
		const db = await getDb(DB_NAME);
		const result = await db.collection("donations").insertOne(donation);

		return NextResponse.json(
			{
				message: "Donation created successfully",
				id: result.insertedId.toString(),
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error creating donation:", error);
		return NextResponse.json(
			{ error: "Failed to create donation" },
			{ status: 500 }
		);
	}
}
