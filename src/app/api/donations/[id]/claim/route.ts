import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getUserById } from "@/lib/db";
import { ObjectId } from "mongodb";
import type { Donation } from "@/lib/types";
import { checkRateLimit, claimRateLimiter } from "@/lib/rate-limit";
import { sendEmail, EmailTemplates } from "@/lib/email";
import { logError, logInfo, logAudit } from "@/lib/logger";

const DB_NAME = process.env.MONGODB_DB_NAME || "foodbridge";

export async function POST(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
        const resolvedParams = await params;
		const session = await getSession();
		if (!session) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 },
			);
		}

		// Rate limiting per user
		const rateLimit = await checkRateLimit(
			`claim:${session.id}`,
			claimRateLimiter,
			20,
			3600000,
		);

		if (!rateLimit.success) {
			return NextResponse.json(
				{ error: "Too many claim attempts. Please try again later." },
				{ status: 429 },
			);
		}

		const user = await getUserById(session.id);
		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 },
			);
		}

		if (user.role !== "distributor") {
			return NextResponse.json(
				{ error: "Only distributors can claim" },
				{ status: 403 },
			);
		}

		let _id: ObjectId;
		try {
			_id = new ObjectId(resolvedParams.id);
		} catch {
			return NextResponse.json(
				{ error: "Invalid donation id" },
				{ status: 400 },
			);
		}

		const db = await getDb(DB_NAME);
		const donation = await db
			.collection<Donation>("donations")
			.findOne({ _id });
		if (!donation) {
			return NextResponse.json(
				{ error: "Donation not found" },
				{ status: 404 },
			);
		}

		if (donation.status !== "available") {
			return NextResponse.json(
				{ error: "Donation is not available" },
				{ status: 400 },
			);
		}

		await db.collection("donations").updateOne(
			{ _id },
			{
				$set: {
					status: "claimed",
					claimedBy: user,
					claimedAt: new Date(),
				},
			},
		);

		// Send email to donor
		if (donation.donor?.email) {
			await sendEmail({
				to: donation.donor.email,
				...EmailTemplates.donationClaimed(
					donation.donor.name,
					donation.title,
					user.name,
				),
			});
		}

		// Send confirmation to distributor
		await sendEmail({
			to: user.email,
			...EmailTemplates.claimConfirmation(
				user.name,
				donation.title,
				donation.location.address ||
					`${donation.location.lat}, ${donation.location.lng}`,
			),
		});

		// Audit log
		logAudit("DONATION_CLAIMED", user.id, {
			donationId: resolvedParams.id,
			donorId: donation.donor?.id,
		});
		logInfo("Donation claimed", {
			userId: user.id,
			donationId: resolvedParams.id,
		});

		return NextResponse.json({ message: "Donation claimed" });
	} catch (error) {
		logError("Error claiming donation", error);
		return NextResponse.json(
			{ error: "Failed to claim donation" },
			{ status: 500 },
		);
	}
}
