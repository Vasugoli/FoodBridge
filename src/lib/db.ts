import { getDb } from "./mongodb";
import { mockDonations } from "./placeholder-data";
import type { User, Donation, SerializableUser } from "./types";
import bcrypt from "bcryptjs";

const DB_NAME = "foodbridge";

// Helper function to serialize MongoDB documents for client components
// Removes _id, converts Dates to ISO strings, removes passwordHash
export function serializeUser(user: any): SerializableUser {
	if (!user) return user;

	const { _id, passwordHash, createdAt, ...rest } = user;
	return {
		...rest,
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
