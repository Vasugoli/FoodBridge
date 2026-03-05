import { getDb } from "./mongodb";
import { mockDonations } from "./placeholder-data";
import type { User, Donation, SerializableUser } from "./types";
import bcrypt from "bcryptjs";

const DB_NAME = "foodbridge";

// Helper function to serialize MongoDB documents for client components
// Removes _id, converts Dates to ISO strings, removes passwordHash
export function serializeUser(user: any): SerializableUser {
	if (!user) return user;

	const { _id, passwordHash, createdAt, trustScore, totalRatings, ...rest } = user;
	return {
		...rest,
		trustScore: trustScore || 0,
		totalRatings: totalRatings || 0,
		createdAt:
			createdAt instanceof Date ? createdAt.toISOString() : createdAt,
	} as SerializableUser;
}

export function serializeDonation(donation: any): Donation {
	if (!donation) return donation;

	const { _id, createdAt, expiry, donor, ...rest } = donation;
	return {
		id: rest.id || _id?.toString() || `donation-${Date.now()}`,
		...rest,
		createdAt:
			createdAt instanceof Date ? createdAt.toISOString() : createdAt,
		expiry: expiry instanceof Date ? expiry.toISOString() : expiry,
		donor: donor ? serializeUser(donor) : donor,
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

	// Hash password
	const passwordHash = await bcrypt.hash(password, 10);

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
		.find({ status: "available" })
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

	const newReview: import("./types").Review = {
		id: `review-${Date.now()}-${Math.random().toString(36).substring(7)}`,
		...reviewData,
		createdAt: new Date(),
	};

	// Insert the review
	await db.collection("reviews").insertOne(newReview);

	// Calculate new trust score for the target user
	const targetUserId = reviewData.targetUserId;
	const reviews = await db.collection<import("./types").Review>("reviews").find({ targetUserId }).toArray();

	const totalRatings = reviews.length;
	const sumRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
	const trustScore = totalRatings > 0 ? sumRatings / totalRatings : 0;

	// Update the user's trustScore and totalRatings
	await db.collection("users").updateOne(
		{ id: targetUserId },
		{
			$set: {
				trustScore,
				totalRatings
			}
		}
	);

	return newReview;
}
