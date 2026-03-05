import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getUserById } from "@/lib/db";
import type { Donation } from "@/lib/types";
import { checkRateLimit, claimRateLimiter } from "@/lib/rate-limit";
import { sendEmail, EmailTemplates } from "@/lib/email";
import { logError, logInfo, logAudit } from "@/lib/logger";
import { broadcast } from "@/lib/sse";
import { ObjectId } from "mongodb";

const DB_NAME = process.env.MONGODB_DB_NAME || "foodbridge";

export async function POST(
	request: NextRequest,
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

		// Optional body: { lat?, lng? } for proximity check
		let bodyLat: number | undefined;
		let bodyLng: number | undefined;
		try {
			const body = await request.json().catch(() => ({}));
			bodyLat = typeof body.lat === "number" ? body.lat : undefined;
			bodyLng = typeof body.lng === "number" ? body.lng : undefined;
		} catch { /* no body is fine */ }

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

		let query: any;
		try {
			query = { $or: [{ _id: new ObjectId(resolvedParams.id) }, { id: resolvedParams.id }] };
		} catch {
			query = { id: resolvedParams.id };
		}

		const db = await getDb(DB_NAME);
		const donation = await db
			.collection<Donation>("donations")
			.findOne(query);
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

		// Proximity warning (soft — never blocks the claim)
		let proximityWarning: string | undefined;
		if (bodyLat !== undefined && bodyLng !== undefined && donation.location) {
			const { haversineKm } = await import("@/lib/matching");
			const distKm = haversineKm(
				bodyLat, bodyLng,
				donation.location.lat, donation.location.lng,
			);
			if (distKm > 50) {
				proximityWarning = `This donation is ${Math.round(distKm)} km away — please confirm you can reach it before the expiry.`;
			}
		}

		await db.collection("donations").updateOne(
			query,
			{
				$set: {
					status: "claimed",
					claimedBy: user,
					claimedAt: new Date(),
				},
			},
		);

		// Emit real-time event to all connected socket clients
		if ((global as any).io) {
			(global as any).io.emit("donation_claimed", {
				donationId: resolvedParams.id,
				claimedBy: {
					id: user.id,
					name: user.name,
				},
			});
		}

		// Send email to donor reliably by fetching fresh donor data
		if (donation.donor?.id) {
			const freshDonorData = await getUserById(donation.donor.id);
			if (freshDonorData && freshDonorData.email) {
				await sendEmail({
					to: freshDonorData.email,
					...EmailTemplates.donationClaimed(
						freshDonorData.name,
						donation.title,
						user.name,
						user.email,
					),
				});
			} else {
				logError("Could not send claim email to donor: missing fresh donor email", { donorId: donation.donor.id });
			}
		}

		// Send confirmation to distributor
		await sendEmail({
			to: user.email,
			...EmailTemplates.claimConfirmation(
				user.name,
				donation.title,
				donation.location.address ||
					`${donation.location.lat}, ${donation.location.lng}`,
				donation.donor?.email || "",
				donation.contactNumber,
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

		// Broadcast real-time event to all SSE subscribers
		broadcast("donation_claimed", {
			donationId: donation.id || resolvedParams.id,
			donationTitle: donation.title,
			distributorName: user.name,
			timestamp: new Date().toISOString(),
		});

		return NextResponse.json({ message: "Donation claimed", proximityWarning });
	} catch (error) {
		logError("Error claiming donation", error);
		return NextResponse.json(
			{ error: "Failed to claim donation" },
			{ status: 500 },
		);
	}
}
