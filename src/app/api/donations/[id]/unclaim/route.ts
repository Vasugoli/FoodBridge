/**
 * POST /api/donations/[id]/unclaim
 *
 * Releases a claimed donation back to "available" so other distributors can
 * pick it up. Only the distributor who originally claimed it may unclaim it.
 * Admin can unclaim any donation.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserById, unclaimDonation, donationIdQuery } from "@/lib/db";
import { getDb } from "@/lib/mongodb";
import type { Donation } from "@/lib/types";
import { broadcast } from "@/lib/sse";
import { logAudit, logError } from "@/lib/logger";

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

		if (user.role !== "distributor" && user.role !== "admin") {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		// Find donation by string id first for the unclaimDonation helper
		const db = await getDb(DB_NAME);
		const donation = await db.collection<Donation>("donations").findOne(donationIdQuery(id));
		if (!donation) {
			return NextResponse.json({ error: "Donation not found" }, { status: 404 });
		}

		// Admin can unclaim anything; distributor can only unclaim their own
		const distributorId = user.role === "admin" ? (donation as any).claimedBy?.id : user.id;
		if (!distributorId) {
			return NextResponse.json({ error: "No claimer found" }, { status: 400 });
		}

		// Use the resolved canonical donation.id (may differ from URL id for ObjectId-only donations)
		const canonicalId = donation.id || id;
		await unclaimDonation(canonicalId, distributorId);

		broadcast("new_donation", {
			donationId: id,
			donationTitle: donation.title,
			note: "unclaimed",
			timestamp: new Date().toISOString(),
		});

		logAudit("DONATION_UNCLAIMED", user.id, { donationId: id });

		return NextResponse.json({ message: "Donation released back to available" });
	} catch (error) {
		if (error instanceof Error && error.message !== "Internal server error") {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}
		logError("Error unclaiming donation", error);
		return NextResponse.json({ error: "Failed to unclaim donation" }, { status: 500 });
	}
}
