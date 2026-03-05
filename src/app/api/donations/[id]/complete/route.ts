/**
 * Phase 2 – Complete Donation
 *
 * POST /api/donations/[id]/complete
 *
 * Marks a claimed donation as "completed". Triggers:
 *   - Donor notification email with impact estimate
 *   - SSE broadcast to all connected clients
 *   - Distributor is encouraged to leave (or receive) a review
 *
 * Only the distributor who claimed the donation (or an admin) may complete it.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getUserById, donationIdQuery } from "@/lib/db";
import type { Donation } from "@/lib/types";
import { sendEmail, EmailTemplates } from "@/lib/email";
import { logError, logAudit } from "@/lib/logger";
import { broadcast } from "@/lib/sse";

const DB_NAME = process.env.MONGODB_DB_NAME || "foodbridge";

/** Very rough meal count from quantity string */
function roughMeals(qty: string): number {
  const n = parseFloat(qty.replace(/[^0-9.]/g, "")) || 1;
  const lower = qty.toLowerCase();
  if (lower.includes("meal") || lower.includes("serving")) return n;
  if (lower.includes("box")) return n * 8;
  if (lower.includes("kg"))  return n * 3;
  if (lower.includes("tray")) return n * 12;
  return n * 4;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserById(session.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const db = await getDb(DB_NAME);
    const query = donationIdQuery(resolvedParams.id);
    const donation = await db
      .collection<Donation>("donations")
      .findOne(query);

    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    if (donation.status !== "claimed") {
      return NextResponse.json(
        { error: "Only claimed donations can be marked complete" },
        { status: 400 },
      );
    }

    // Only the claiming distributor or admin may complete
    const isClaimant =
      (donation as any).claimedBy?.id === user.id;
    if (!isClaimant && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.collection("donations").updateOne(
      query,
      { $set: { status: "completed", completedAt: new Date() } },
    );

    const meals = roughMeals(donation.quantity || "");

    // Notify donor
    if (donation.donor?.email) {
      await sendEmail({
        to: donation.donor.email as string,
        ...EmailTemplates.donationCompleted(
          (donation.donor as any).name || "Donor",
          donation.title,
          user.name,
          meals,
        ),
      }).catch(() => {});
    }

    // SSE broadcast
    broadcast("donation_completed", {
      donationId: donation.id || resolvedParams.id,
      donationTitle: donation.title,
      distributorName: user.name,
      estimatedMeals: meals,
      timestamp: new Date().toISOString(),
    });

    logAudit("DONATION_COMPLETED", user.id, {
      donationId: resolvedParams.id,
      estimatedMeals: meals,
    });

    return NextResponse.json({
      message: "Donation marked as completed",
      estimatedMeals: meals,
    });
  } catch (error) {
    logError("Error completing donation", error);
    return NextResponse.json({ error: "Failed to complete donation" }, { status: 500 });
  }
}
