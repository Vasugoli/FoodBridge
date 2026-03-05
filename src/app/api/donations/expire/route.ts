/**
 * Phase 2 – Auto-Expire Donations
 *
 * POST /api/donations/expire
 *
 * Marks all "available" donations past their expiry date as "expired".
 * Designed to be called by a cron job (Vercel cron / external cron service).
 * Also callable manually by admins for immediate cleanup.
 *
 * Authorization: Bearer token from CRON_SECRET env var, OR an admin session.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import { getDb } from "@/lib/mongodb";
import { sendEmail, EmailTemplates } from "@/lib/email";
import { logInfo, logError, logAudit } from "@/lib/logger";
import { broadcast } from "@/app/api/events/route";

const DB_NAME = process.env.MONGODB_DB_NAME || "foodbridge";

export async function POST(request: NextRequest) {
  try {
    // Allow cron secret auth OR admin session
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    let isAuthorized = false;

    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
      isAuthorized = true;
    } else {
      const session = await getSession();
      if (session) {
        const user = await getUserById(session.id);
        if (user?.role === "admin") isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb(DB_NAME);
    const now = new Date();

    // Find all available donations that have passed expiry
    const expiredDonations = await db
      .collection("donations")
      .find({
        status: "available",
        expiry: { $lt: now },
      })
      .toArray();

    if (expiredDonations.length === 0) {
      return NextResponse.json({ expired: 0, message: "No expired donations found" });
    }

    // Bulk update status to "expired"
    const ids = expiredDonations.map((d) => d.id);
    await db.collection("donations").updateMany(
      { status: "available", expiry: { $lt: now } },
      { $set: { status: "expired" } },
    );

    logAudit("AUTO_EXPIRE", "system", { count: expiredDonations.length, ids });

    // Notify donors and broadcast SSE events
    for (const donation of expiredDonations) {
      // SSE broadcast to all connected clients
      broadcast("donation_expired", {
        donationId: donation.id || donation._id?.toString(),
        donationTitle: donation.title,
        timestamp: now.toISOString(),
      });

      // Email notification to donor
      if (donation.donor?.email) {
        await sendEmail({
          to: donation.donor.email,
          ...EmailTemplates.donationExpired(
            donation.donor.name || "Donor",
            donation.title,
          ),
        }).catch(() => {}); // non-critical
      }
    }

    logInfo(`Auto-expired ${expiredDonations.length} donations`);

    return NextResponse.json({
      expired: expiredDonations.length,
      ids,
    });
  } catch (error) {
    logError("Auto-expire failed", error);
    return NextResponse.json({ error: "Auto-expire failed" }, { status: 500 });
  }
}
