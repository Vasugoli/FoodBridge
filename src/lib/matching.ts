/**
 * Phase 2 – Advanced Matching Engine
 *
 * Scores donations by urgency + optional geo-proximity so the most at-risk
 * food floats to the top of the distributor feed.
 *
 * Score formula (0-100):
 *   40% expiry urgency
 *   30% donor trust score (promotes reliable donors)
 *   20% distance (if lat/lng supplied by the distributor)
 *   10% age of listing (older = more chance of waste)
 */

import type { Donation, MatchedDonation, UrgencyLevel } from "./types";

// ── Haversine distance (km) ──────────────────────────────────────────────────
export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Urgency classification ───────────────────────────────────────────────────
export function getUrgencyLevel(hoursUntilExpiry: number): UrgencyLevel {
  if (hoursUntilExpiry <= 6)  return "critical";
  if (hoursUntilExpiry <= 24) return "high";
  if (hoursUntilExpiry <= 72) return "medium";
  return "normal";
}

export const urgencyColors: Record<UrgencyLevel, string> = {
  critical: "bg-red-100 text-red-700 border-red-300",
  high:     "bg-orange-100 text-orange-700 border-orange-300",
  medium:   "bg-yellow-100 text-yellow-700 border-yellow-300",
  normal:   "bg-emerald-100 text-emerald-700 border-emerald-300",
};

export const urgencyLabels: Record<UrgencyLevel, string> = {
  critical: "🔴 Critical",
  high:     "🟠 Urgent",
  medium:   "🟡 Soon",
  normal:   "🟢 Normal",
};

// ── Score individual donation ────────────────────────────────────────────────
function scoreDonation(
  donation: Donation,
  distributorLat?: number,
  distributorLng?: number,
): { score: number; distanceKm?: number; hoursUntilExpiry: number } {
  const now = new Date();
  const expiry = new Date(donation.expiry);
  const hoursUntilExpiry = Math.max(
    0,
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60),
  );

  // --- Expiry sub-score (40 pts) -------------------------------------------
  let expiryScore = 0;
  if (hoursUntilExpiry <= 6)        expiryScore = 40;
  else if (hoursUntilExpiry <= 24)  expiryScore = 30;
  else if (hoursUntilExpiry <= 72)  expiryScore = 20;
  else if (hoursUntilExpiry <= 168) expiryScore = 10;
  else                               expiryScore = 5;

  // --- Donor trust sub-score (30 pts) --------------------------------------
  const trust = (donation.donor as any)?.trustScore ?? 50;
  const trustScore = Math.round((trust / 100) * 30);

  // --- Distance sub-score (20 pts) -----------------------------------------
  let distanceScore = 10; // neutral when geo not supplied
  let distanceKm: number | undefined;
  if (
    distributorLat !== undefined &&
    distributorLng !== undefined &&
    donation.location?.lat &&
    donation.location?.lng
  ) {
    distanceKm = haversineKm(
      distributorLat,
      distributorLng,
      donation.location.lat,
      donation.location.lng,
    );
    // 20 pts if ≤2 km, scales linearly to 0 at ≥20 km
    distanceScore = Math.round(Math.max(0, 20 - (distanceKm / 20) * 20));
  }

  // --- Listing age sub-score (10 pts) ---------------------------------------
  const ageHours =
    (now.getTime() - new Date(donation.createdAt).getTime()) / (1000 * 60 * 60);
  // Older listings get more urgency (max 10 pts at 48 h)
  const ageScore = Math.min(10, Math.round((ageHours / 48) * 10));

  const totalScore = expiryScore + trustScore + distanceScore + ageScore;

  return { score: Math.min(100, totalScore), distanceKm, hoursUntilExpiry };
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns available donations ranked from most urgent to least.
 *
 * @param donations    Available donations to rank
 * @param lat          Distributor's latitude (optional)
 * @param lng          Distributor's longitude (optional)
 * @param maxResults   Cap result count (default 50)
 */
export function rankDonations(
  donations: Donation[],
  lat?: number,
  lng?: number,
  maxResults = 50,
): MatchedDonation[] {
  const scored = donations
    .filter((d) => d.status === "available")
    .map((d, idx) => {
      const { score, distanceKm, hoursUntilExpiry } = scoreDonation(d, lat, lng);
      const matched: MatchedDonation = {
        ...d,
        urgencyScore: score,
        urgencyLevel: getUrgencyLevel(hoursUntilExpiry),
        distanceKm,
        hoursUntilExpiry,
        priorityRank: idx + 1, // will be reassigned below
      };
      return matched;
    });

  // Sort descending by score
  scored.sort((a, b) => b.urgencyScore - a.urgencyScore);

  // Assign rank after sorting
  scored.forEach((d, i) => {
    d.priorityRank = i + 1;
  });

  return scored.slice(0, maxResults);
}
