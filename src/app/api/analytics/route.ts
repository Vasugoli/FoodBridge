/**
 * Phase 2 – Analytics API
 *
 * GET /api/analytics
 * Returns real KPI data for the admin dashboard.
 * Only accessible to admin users.
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import { getImpactMetrics } from "@/lib/analytics";
import { logError } from "@/lib/logger";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserById(session.id);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const metrics = await getImpactMetrics();

    return NextResponse.json(metrics, {
      headers: {
        // Cache for 5 minutes on the CDN / Next.js data cache
        "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    logError("Analytics fetch failed", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
