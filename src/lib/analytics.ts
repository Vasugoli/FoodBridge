/**
 * Phase 2 – Analytics Engine
 *
 * Computes real KPI data from MongoDB collections for the admin dashboard.
 * Averages and trends replace the random numbers previously used.
 */

import { getDb } from "./mongodb";
import type { ImpactMetrics, DonationTrend } from "./types";
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns";

const DB_NAME = process.env.MONGODB_DB_NAME || "foodbridge";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Estimate meals saved from quantity strings like "10 meals", "2 boxes", "5 kg" */
function estimateMeals(quantityStr: string): number {
  const lower = quantityStr.toLowerCase();
  const num = parseFloat(lower.replace(/[^0-9.]/g, "")) || 1;

  if (lower.includes("meal"))       return num;
  if (lower.includes("box"))        return num * 8;
  if (lower.includes("kg"))         return num * 3;
  if (lower.includes("lb"))         return num * 1.4;
  if (lower.includes("tray"))       return num * 12;
  if (lower.includes("serving"))    return num;
  if (lower.includes("can"))        return num * 2;
  return num * 4; // default fallback
}

// ── Monthly trend aggregation ────────────────────────────────────────────────

async function buildTrends(
  db: Awaited<ReturnType<typeof getDb>>,
): Promise<DonationTrend[]> {
  const trends: DonationTrend[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const from = startOfMonth(monthDate);
    const to   = endOfMonth(monthDate);

    const [totalDocs, claimedDocs, completedDocs] = await Promise.all([
      db.collection("donations").countDocuments({
        createdAt: { $gte: from, $lte: to },
      }),
      db.collection("donations").countDocuments({
        createdAt: { $gte: from, $lte: to },
        status: { $in: ["claimed", "completed"] },
      }),
      db.collection("donations").countDocuments({
        createdAt: { $gte: from, $lte: to },
        status: "completed",
      }),
    ]);

    trends.push({
      label: format(monthDate, "MMM"),
      donations: totalDocs,
      claimed: claimedDocs,
      completed: completedDocs,
    });
  }

  return trends;
}

// ── Average time-to-claim ────────────────────────────────────────────────────

async function avgTimeToClaimHours(
  db: Awaited<ReturnType<typeof getDb>>,
): Promise<number> {
  // We don't currently store claimedAt separately, so fall back to a
  // rough estimate using completed donations.
  const sample = await db
    .collection("donations")
    .find({ status: { $in: ["claimed", "completed"] }, "claimedBy.id": { $exists: true } })
    .limit(100)
    .toArray();

  if (sample.length === 0) return 0;

  // Approximate: use diff between createdAt and expiry / 2
  const diffs = sample.map((d: any) => {
    const created = new Date(d.createdAt).getTime();
    const expiry  = new Date(d.expiry).getTime();
    const midpoint = expiry - created;
    return midpoint / 2 / (1000 * 60 * 60);
  });

  return parseFloat((diffs.reduce((a, b) => a + b, 0) / diffs.length).toFixed(1));
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function getImpactMetrics(): Promise<ImpactMetrics> {
  const db = await getDb(DB_NAME);

  const [
    allDonations,
    totalUsers,
    donorsCount,
    distributorsCount,
    availableCount,
    claimedCount,
    completedCount,
    expiredCount,
    trends,
    avgClaim,
  ] = await Promise.all([
    db.collection("donations").find().toArray(),
    db.collection("users").countDocuments(),
    db.collection("users").countDocuments({ role: "donor" }),
    db.collection("users").countDocuments({ role: "distributor" }),
    db.collection("donations").countDocuments({ status: "available" }),
    db.collection("donations").countDocuments({ status: "claimed" }),
    db.collection("donations").countDocuments({ status: "completed" }),
    db.collection("donations").countDocuments({ status: "expired" }),
    buildTrends(db),
    avgTimeToClaimHours(db),
  ]);

  const totalDonations = allDonations.length;
  const nonExpired = availableCount + claimedCount + completedCount;

  // Completion rate = completed / (completed + available + claimed) * 100
  const completionRate =
    nonExpired > 0 ? parseFloat(((completedCount / nonExpired) * 100).toFixed(1)) : 0;

  // Claim rate = (claimed + completed) / total * 100
  const claimRate =
    totalDonations > 0
      ? parseFloat((((claimedCount + completedCount) / totalDonations) * 100).toFixed(1))
      : 0;

  // Impact estimates for completed donations
  const completedDonations = allDonations.filter((d: any) => d.status === "completed");
  const estimatedMealsSaved = completedDonations.reduce(
    (sum: number, d: any) => sum + estimateMeals(d.quantity || ""),
    0,
  );

  // CO2: ~2.5 kg CO2e per kg of food saved; rough meal weight = 0.4 kg
  const estimatedCO2Saved = parseFloat((estimatedMealsSaved * 0.4 * 2.5).toFixed(1));

  return {
    totalDonations,
    totalUsers,
    donorsCount,
    distributorsCount,
    availableCount,
    claimedCount,
    completedCount,
    expiredCount,
    completionRate,
    claimRate,
    estimatedMealsSaved,
    estimatedCO2Saved,
    avgTimeToClaimHours: avgClaim,
    trends,
  };
}
