/**
 * Phase 2 – Advanced Matching API
 *
 * GET /api/matching?lat=<number>&lng=<number>&limit=<number>
 *
 * Returns available donations sorted by urgency score.
 * If lat/lng are provided, geo-proximity is factored in.
 * Accessible to distributors and admins.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import { getAvailableDonations, serializeDonation } from "@/lib/db";
import { rankDonations } from "@/lib/matching";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserById(session.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!["distributor", "admin"].includes(user.role)) {
      return NextResponse.json(
        { error: "Only distributors can access the matching feed" },
        { status: 403 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const lat   = searchParams.get("lat")   ? parseFloat(searchParams.get("lat")!)   : undefined;
    const lng   = searchParams.get("lng")   ? parseFloat(searchParams.get("lng")!)   : undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!)   : 50;

    // Validate numbers when provided
    if ((lat !== undefined && isNaN(lat)) || (lng !== undefined && isNaN(lng))) {
      return NextResponse.json(
        { error: "Invalid lat/lng values" },
        { status: 400 },
      );
    }

    const donations = await getAvailableDonations();
    const ranked = rankDonations(donations, lat, lng, limit);

    // Serialize (strip _id etc.) but preserve urgency fields
    const result = ranked.map((d) => ({
      ...serializeDonation(d),
      urgencyLevel:     d.urgencyLevel,
      urgencyScore:     d.urgencyScore,
      distanceKm:       d.distanceKm,
      hoursUntilExpiry: d.hoursUntilExpiry,
      priorityRank:     d.priorityRank,
    }));

    return NextResponse.json({ data: result, total: result.length });
  } catch (error) {
    logError("Matching API failed", error);
    return NextResponse.json(
      { error: "Failed to compute matches" },
      { status: 500 },
    );
  }
}
