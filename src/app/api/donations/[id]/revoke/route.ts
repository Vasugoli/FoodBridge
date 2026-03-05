/**
 * POST /api/donations/[id]/revoke
 *
 * Allows the **donor** who posted a donation to revoke it from an untrustworthy
 * distributor. The donation is returned to "available" status so another
 * distributor can claim it.
 *
 * Only the original donor may call this endpoint.
 * Admins may also use this for moderation.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getUserById, donationIdQuery } from "@/lib/db";
import type { Donation } from "@/lib/types";
import { sendEmail, EmailTemplates } from "@/lib/email";
import { logAudit, logError } from "@/lib/logger";
import { broadcast } from "@/lib/sse";

const DB_NAME = process.env.MONGODB_DB_NAME || "foodbridge";

export async function POST(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;

		const session = await getSession();
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const user = await getUserById(session.id);
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const db = await getDb(DB_NAME);
		const query = donationIdQuery(id);
		const donation = await db.collection<Donation>("donations").findOne(query);

		if (!donation) {
			return NextResponse.json({ error: "Donation not found" }, { status: 404 });
		}

		// Only the donor or admin may revoke
		const isDonor = (donation as any).donor?.id === user.id;
		if (!isDonor && user.role !== "admin") {
			return NextResponse.json(
				{ error: "Only the donor who posted this donation can revoke it" },
				{ status: 403 },
			);
		}

		if (donation.status !== "claimed") {
			return NextResponse.json(
				{ error: "Only claimed donations can be revoked" },
				{ status: 400 },
			);
		}

		const distributorName  = (donation as any).claimedBy?.name  ?? "the distributor";
		const distributorEmail = (donation as any).claimedBy?.email;

		// Reset donation back to available
		await db.collection("donations").updateOne(query, {
			$set: {
				status:      "available",
				unclaimedAt: new Date(),
			},
			$unset: {
				claimedBy: "",
				claimedAt: "",
			},
		});

		// Notify the distributor that their claim was revoked
		if (distributorEmail) {
			await sendEmail({
				to: distributorEmail,
				subject: "Claim Revoked – FoodBridge",
				html: `
					<p>Hi ${distributorName},</p>
					<p>We wanted to let you know that the donor has revoked the claim on
					<strong>${donation.title}</strong>. The donation is now available for
					other distributors to claim.</p>
					<p>If you believe this was an error, please contact support.</p>
					<p>– The FoodBridge Team</p>
				`,
			}).catch(() => {});
		}

		// SSE broadcast so other distributors see it pop up
		broadcast("new_donation", {
			donationId:    donation.id || id,
			donationTitle: donation.title,
			note:          "revoked — now available",
			timestamp:     new Date().toISOString(),
		});

		logAudit("DONATION_REVOKED", user.id, {
			donationId:      id,
			previousClaimer: (donation as any).claimedBy?.id,
		});

		return NextResponse.json({ message: "Claim revoked. Donation is available again." });
	} catch (error) {
		logError("Error revoking donation", error);
		return NextResponse.json({ error: "Failed to revoke donation" }, { status: 500 });
	}
}
