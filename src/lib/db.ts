import { getDb } from "./mongodb";
import { mockDonations } from "./placeholder-data";
import type { User, Donation, SerializableUser, DonationReport, CoordinationMessage } from "./types";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

const DB_NAME = "foodbridge";

/**
 * Build a MongoDB query that matches a donation by either:
 *  - the app's custom string `id` field, OR
 *  - the MongoDB `_id` ObjectId (when the id looks like a hex ObjectId).
 *
 * Seeded or legacy donations may have `_id.toString()` as their `id` value,
 * so we always try both paths.
 */
export function donationIdQuery(id: string) {
	try {
		return { $or: [{ id }, { _id: new ObjectId(id) }] };
	} catch {
		// id is not a valid ObjectId hex — plain string match only
		return { id };
	}
}

// Helper function to serialize MongoDB documents for client components
// Removes _id, converts Dates to ISO strings, removes passwordHash
export function serializeUser(user: any): SerializableUser {
	if (!user) return user;

	const { _id, passwordHash, createdAt, trustScore, totalRatings, ratingAvg, isVerified, isSuspended, organizationName, ...rest } = user;
	return {
		...rest,
		trustScore:       trustScore      ?? 0,
		totalRatings:     totalRatings    ?? 0,
		ratingAvg:        ratingAvg       ?? 0,
		isVerified:       isVerified      ?? false,
		isSuspended:      isSuspended     ?? false,
		organizationName: organizationName ?? undefined,
		createdAt:        createdAt instanceof Date ? createdAt.toISOString() : createdAt,
	} as SerializableUser;
}

export function serializeDonation(donation: any): Donation {
	if (!donation) return donation;

	const { _id, createdAt, expiry, donor, completedAt, unclaimedAt, coordinationMessages, claimedBy, ...rest } = donation;

	// Serialize coordination messages: convert any Date createdAt to ISO string
	const serializedMessages: CoordinationMessage[] | undefined = coordinationMessages
		? (coordinationMessages as any[]).map((m: any) => ({
				...m,
				createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
		  }))
		: undefined;

	return {
		id: rest.id || _id?.toString() || `donation-${Date.now()}`,
		...rest,
		createdAt:             createdAt   instanceof Date ? createdAt.toISOString()   : createdAt,
		expiry:                expiry      instanceof Date ? expiry.toISOString()      : expiry,
		completedAt:           completedAt instanceof Date ? completedAt.toISOString() : completedAt,
		unclaimedAt:           unclaimedAt instanceof Date ? unclaimedAt.toISOString() : unclaimedAt,
		donor:                 donor ? serializeUser(donor) : donor,
		claimedBy:             claimedBy ? serializeUser(claimedBy) : claimedBy,
		coordinationMessages:  serializedMessages,
	} as Donation;
}

// Basic convenience wrappers for server-side code. These will use MongoDB
// only when MONGODB_URI is configured. Otherwise they can be used as helpers
// when you want to read mock data.

export async function getUsersFromDb() {
	const db = await getDb(DB_NAME);
	const users = await db.collection<User>("users").find().toArray();
	return users.map(serializeUser);
}

export async function getUserById(id: string) {
	const db = await getDb(DB_NAME);
	const user = await db.collection<User>("users").findOne({ id });
	return user ? serializeUser(user) : null;
}

export async function getUserByRole(role: User["role"]) {
	const db = await getDb(DB_NAME);
	const user = await db.collection<User>("users").findOne({ role });
	return user ? serializeUser(user) : null;
}

export async function getUsersByRoleList(role: User["role"]) {
	const db = await getDb(DB_NAME);
	const users = await db.collection<User>("users").find({ role }).toArray();
	return users.map(serializeUser);
}

// Authentication functions
export async function getUserByEmail(email: string) {
	const db = await getDb(DB_NAME);
	const user = await db.collection<User>("users").findOne({ email });
	return user;
}

export async function createUser(
	name: string,
	email: string,
	password: string,
	role: User["role"]
) {
	const db = await getDb(DB_NAME);

	// Check if user already exists
	const existingUser = await getUserByEmail(email);
	if (existingUser) {
		throw new Error("User with this email already exists");
	}

	// Hash password — use a low cost factor in dev for faster test iteration
	const saltRounds = process.env.NODE_ENV === "production" ? 12 : 4;
	const passwordHash = await bcrypt.hash(password, saltRounds);

	// Generate user ID
	const id = `user-${Date.now()}-${Math.random().toString(36).substring(7)}`;

	// Create user object
	const newUser: User = {
		id,
		name,
		email,
		role,
		avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
		createdAt: new Date(),
		passwordHash,
		trustScore: 0,
		totalRatings: 0,
	};

	// Insert user into database
	await db.collection("users").insertOne(newUser);

	// Return user without password hash
	const { passwordHash: _, ...userWithoutPassword } = newUser;
	return userWithoutPassword;
}

export async function verifyUserPassword(email: string, password: string) {
	const user = await getUserByEmail(email);

	if (!user || !user.passwordHash) {
		return null;
	}

	const isValid = await bcrypt.compare(password, user.passwordHash);

	if (!isValid) {
		return null;
	}

	// Return user without password hash
	const { passwordHash: _, ...userWithoutPassword } = user;
	return userWithoutPassword;
}

export async function updateUserProfile(id: string, name: string, email: string) {
	const db = await getDb(DB_NAME);

	// Check if the new email is already used by another user
	const existingUser = await getUserByEmail(email);
	if (existingUser && existingUser.id !== id) {
		throw new Error("Email is already in use by another account");
	}

	const result = await db.collection("users").findOneAndUpdate(
		{ id },
		{ $set: { name, email } },
		{ returnDocument: 'after' }
	);

	if (!result) {
		throw new Error("User not found");
	}

	const { passwordHash: _, ...userWithoutPassword } = result as any;
	return serializeUser(userWithoutPassword);
}

export async function updateUserPassword(id: string, newPasswordHash: string) {
	const db = await getDb(DB_NAME);

	const result = await db.collection("users").updateOne(
		{ id },
		{ $set: { passwordHash: newPasswordHash } }
	);

	if (result.matchedCount === 0) {
		throw new Error("User not found");
	}

	return true;
}

export async function getDonationsFromDb() {
	const db = await getDb(DB_NAME);
	const donations = await db
		.collection<Donation>("donations")
		.find()
		.sort({ createdAt: -1 })
		.toArray();
	return donations.map(serializeDonation);
}

export async function getDonationsByDonor(donorId: string) {
	const db = await getDb(DB_NAME);
	const donations = await db
		.collection<Donation>("donations")
		.find({ "donor.id": donorId })
		.sort({ createdAt: -1 })
		.toArray();
	return donations.map(serializeDonation);
}

export async function getAvailableDonations() {
	const db = await getDb(DB_NAME);
	const donations = await db
		.collection<Donation>("donations")
		.find({ status: "available", isHidden: { $ne: true } })
		.sort({ createdAt: -1 })
		.toArray();
	return donations.map(serializeDonation);
}

export async function getDonationsClaimedByDistributor(distributorId: string) {
	const db = await getDb(DB_NAME);
	const donations = await db
		.collection<Donation>("donations")
		.find({ status: "claimed", "claimedBy.id": distributorId })
		.sort({ createdAt: -1 })
		.toArray();
	return donations.map(serializeDonation);
}

export async function seedSampleData() {
	const db = await getDb(DB_NAME);

	// normalize dates to ISO strings so they persist cleanly
	const donationsToInsert = mockDonations.map((d) => ({
		...d,
		createdAt:
			d.createdAt instanceof Date
				? d.createdAt.toISOString()
				: d.createdAt,
		expiry: d.expiry instanceof Date ? d.expiry.toISOString() : d.expiry,
	}));

	// Clear existing data
	await db.collection("donations").deleteMany({});

	// Insert only donations (users are now managed through MongoDB directly, not from mock data)
	const donationsResult = await db
		.collection("donations")
		.insertMany(donationsToInsert as any[]);

	return {
		insertedDonations: donationsResult.insertedCount,
	};
}

export async function addReview(reviewData: Omit<import("./types").Review, "id" | "createdAt">) {
	const db = await getDb(DB_NAME);

	// Prevent duplicate reviews for the same donation by the same reviewer
	const existing = await db.collection("reviews").findOne({
		reviewerId: reviewData.reviewerId,
		donationId: reviewData.donationId,
	});
	if (existing) throw new Error("You have already reviewed this partner for this donation");

	const newReview: import("./types").Review = {
		id: `review-${Date.now()}-${Math.random().toString(36).substring(7)}`,
		...reviewData,
		createdAt: new Date(),
	};
	await db.collection("reviews").insertOne(newReview);

	// Recompute trust score for the target user
	await recomputeTrustScore(reviewData.targetUserId);

	return newReview;
}

/**
 * Trust Score formula (0–100):
 *   60 % → rating average (1–5 mapped to 0–100)
 *   40 % → completion rate (completed donations / claimed donations)
 *
 * Minimum 3 data points required before scoring meaningfully.
 */
export async function recomputeTrustScore(userId: string) {
	const db = await getDb(DB_NAME);

	// Rating component
	const reviews = await db.collection<import("./types").Review>("reviews")
		.find({ targetUserId: userId }).toArray();
	const totalRatings = reviews.length;
	const ratingAvg    = totalRatings > 0
		? reviews.reduce((s, r) => s + r.rating, 0) / totalRatings
		: 0;
	const ratingScore  = (ratingAvg / 5) * 100; // 0–100

	// Completion component: how many donations the user completed as distributor
	const [completedCount, claimedCount] = await Promise.all([
		db.collection("donations").countDocuments({ "claimedBy.id": userId, status: "completed" }),
		db.collection("donations").countDocuments({ "claimedBy.id": userId }),
	]);
	const completionRate  = claimedCount > 0 ? completedCount / claimedCount : 0;
	const completionScore = completionRate * 100; // 0–100

	// Weighted composite
	const trustScore = totalRatings === 0 && claimedCount === 0
		? 0
		: Math.round(ratingScore * 0.6 + completionScore * 0.4);

	await db.collection("users").updateOne(
		{ id: userId },
		{ $set: { trustScore, totalRatings, ratingAvg } }
	);
	return trustScore;
}

/** Fetch all distributors (for expiry-alert broadcasts) */
export async function getAllDistributors() {
	const db = await getDb(DB_NAME);
	const users = await db.collection<User>("users")
		.find({ role: "distributor" }).toArray();
	return users.map(serializeUser);
}

/** Donations that are still available and expire within `withinHours`. */
export async function getExpiringSoonDonations(withinHours = 6) {
	const db = await getDb(DB_NAME);
	const cutoff = new Date(Date.now() + withinHours * 60 * 60 * 1000);
	const donations = await db.collection<Donation>("donations")
		.find({ status: "available", expiry: { $lte: cutoff.toISOString() } })
		.sort({ expiry: 1 }).toArray();
	return donations.map(serializeDonation);
}

/** Release a claimed donation back to available */
export async function unclaimDonation(donationId: string, distributorId: string) {
	const db = await getDb(DB_NAME);
	const donation = await db.collection<Donation>("donations")
		.findOne({ id: donationId });
	if (!donation) throw new Error("Donation not found");
	if (donation.status !== "claimed") throw new Error("Donation is not currently claimed");
	if ((donation as any).claimedBy?.id !== distributorId) throw new Error("You did not claim this donation");

	await db.collection("donations").updateOne(
		{ id: donationId },
		{
			$set:   { status: "available", unclaimedAt: new Date() },
			$unset: { claimedBy: "" },
		}
	);
}

/** Save or update a pickup coordination note on a donation */
export async function setPickupNote(donationId: string, note: string) {
	const db = await getDb(DB_NAME);
	await db.collection("donations").updateOne(
		{ id: donationId },
		{ $set: { pickupNote: note.trim().slice(0, 500) } }
	);
}

/** Flag a donation as unsafe / misrepresented */
export async function reportDonation(data: Omit<DonationReport, "id" | "createdAt">) {
	const db = await getDb(DB_NAME);

	// Prevent duplicate reports from the same user
	const existing = await db.collection("reports").findOne({
		donationId: data.donationId,
		reporterId: data.reporterId,
	});
	if (existing) throw new Error("You have already reported this donation");

	const report: DonationReport = {
		id: `report-${Date.now()}-${Math.random().toString(36).substring(7)}`,
		...data,
		createdAt: new Date(),
	};
	await db.collection("reports").insertOne(report);

	// Increment report count on donation
	const updateResult = await db.collection("donations").findOneAndUpdate(
		{ id: data.donationId },
		{ $inc: { reportCount: 1 } },
		{ returnDocument: "after" },
	);

	// Auto-hide when reportCount hits the threshold (3 reports)
	const REPORT_HIDE_THRESHOLD = 3;
	const updatedCount: number = (updateResult as any)?.reportCount ?? 0;
	if (updatedCount >= REPORT_HIDE_THRESHOLD) {
		await db.collection("donations").updateOne(
			{ id: data.donationId },
			{ $set: { isHidden: true } },
		);
	}

	return report;
}

/** Check if a user has already reviewed a donation */
export async function hasReviewed(reviewerId: string, donationId: string): Promise<boolean> {
	const db = await getDb(DB_NAME);
	const existing = await db.collection("reviews").findOne({ reviewerId, donationId });
	return !!existing;
}

// ─────────────────────────────────────────────────────────────────────────────
// Coordination Message Thread
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Appends a new message to the coordination thread of a donation.
 * Also updates `pickupNote` with the latest message for backwards compat.
 */
export async function addCoordinationMessage(
	donationId: string,
	message: CoordinationMessage,
) {
	const db = await getDb(DB_NAME);
	await db.collection("donations").updateOne(
		donationIdQuery(donationId),
		{
			$push: { coordinationMessages: message } as any,
			$set:  { pickupNote: message.message },
		},
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin: Reports Queue
// ─────────────────────────────────────────────────────────────────────────────

export async function getAdminReports() {
	const db = await getDb(DB_NAME);
	const reports = await db
		.collection("reports")
		.find()
		.sort({ createdAt: -1 })
		.toArray();

	return reports.map((r: any) => {
		const { _id, createdAt, ...rest } = r;
		return {
			...rest,
			createdAt: createdAt instanceof Date ? createdAt.toISOString() : createdAt,
		};
	});
}

/** Admin: unhide a donation that was auto-hidden by reports */
export async function unhideDonation(donationId: string) {
	const db = await getDb(DB_NAME);
	await db.collection("donations").updateOne(
		{ id: donationId },
		{ $set: { isHidden: false } },
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin: User Management
// ─────────────────────────────────────────────────────────────────────────────

/** Admin: verify or unverify a user (e.g., confirm a distributor is legitimate) */
export async function setUserVerified(userId: string, verified: boolean) {
	const db = await getDb(DB_NAME);
	await db.collection("users").updateOne(
		{ id: userId },
		{ $set: { isVerified: verified } },
	);
}

/** Admin: suspend or unsuspend a user account */
export async function setUserSuspended(userId: string, suspended: boolean) {
	const db = await getDb(DB_NAME);
	await db.collection("users").updateOne(
		{ id: userId },
		{ $set: { isSuspended: suspended } },
	);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public Stats (for landing page)
// ─────────────────────────────────────────────────────────────────────────────

export async function getPublicStats() {
	try {
		const db = await getDb(DB_NAME);
		const [completedCount, donorsCount, totalDonations] = await Promise.all([
			db.collection("donations").countDocuments({ status: "completed" }),
			db.collection("users").countDocuments({ role: "donor" }),
			db.collection("donations").countDocuments({}),
		]);

		// Rough meal estimate: each completed donation ≈ 5 meals
		const estimatedMeals = completedCount * 5;

		return {
			estimatedMeals,
			donorsCount,
			totalDonations,
		};
	} catch {
		// Fallback if DB unreachable during static build
		return { estimatedMeals: 0, donorsCount: 0, totalDonations: 0 };
	}
}

/** Reset a user's password (called after token verification) */
export async function resetUserPassword(userId: string, newPassword: string) {
	const db = await getDb(DB_NAME);
	const saltRounds = process.env.NODE_ENV === "production" ? 12 : 4;
	const passwordHash = await bcrypt.hash(newPassword, saltRounds);
	await db.collection("users").updateOne(
		{ id: userId },
		{ $set: { passwordHash } },
	);
}

