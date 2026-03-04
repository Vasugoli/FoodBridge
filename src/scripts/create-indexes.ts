// Load environment variables FIRST before any other imports
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || "foodbridge";

if (!MONGODB_URI) {
	console.error("❌ Error: MONGODB_URI environment variable is not set");
	console.log("Please set MONGODB_URI in your .env.local file");
	process.exit(1);
}

async function createIndexes() {
	console.log("🔧 Creating MongoDB indexes...");

	const client = new MongoClient(MONGODB_URI as string);

	try {
		await client.connect();
		console.log("✅ Connected to MongoDB");

		const db = client.db(DB_NAME);

		// Users collection indexes
		console.log("Creating indexes for 'users' collection...");
		await db
			.collection("users")
			.createIndex({ email: 1 }, { unique: true });
		await db.collection("users").createIndex({ id: 1 }, { unique: true });
		await db.collection("users").createIndex({ role: 1 });
		await db.collection("users").createIndex({ emailVerified: 1 });
		console.log("✅ Users indexes created");

		// Donations collection indexes
		console.log("Creating indexes for 'donations' collection...");
		await db.collection("donations").createIndex({ status: 1 });
		await db.collection("donations").createIndex({ "donor.id": 1 });
		await db.collection("donations").createIndex({ "claimedBy.id": 1 });
		await db.collection("donations").createIndex({ expiry: 1 });
		await db.collection("donations").createIndex({ createdAt: -1 });

		// Compound indexes for common queries
		await db
			.collection("donations")
			.createIndex({ status: 1, expiry: 1, createdAt: -1 });
		await db
			.collection("donations")
			.createIndex({ "donor.id": 1, status: 1, createdAt: -1 });
		await db
			.collection("donations")
			.createIndex({ status: 1, createdAt: -1 });

		// Geospatial index for location-based queries
		// NOTE: Skipped for now - requires location field to be in GeoJSON format
		// Current format: { address: string, lat: number, lng: number }
		// Required format: { type: "Point", coordinates: [lng, lat] }
		// await db.collection("donations").createIndex({ "location": "2dsphere" });
		console.log("ℹ️  Skipping geospatial index (requires GeoJSON format)");

		// Text search index
		await db
			.collection("donations")
			.createIndex(
				{ title: "text", description: "text" },
				{ weights: { title: 2, description: 1 } },
			);
		console.log("✅ Donations indexes created");

		// Email verifications collection indexes
		console.log("Creating indexes for 'email_verifications' collection...");
		await db
			.collection("email_verifications")
			.createIndex({ token: 1 }, { unique: true });
		await db.collection("email_verifications").createIndex({ userId: 1 });
		await db.collection("email_verifications").createIndex(
			{ expiresAt: 1 },
			{ expireAfterSeconds: 0 }, // TTL index - auto-delete expired tokens
		);
		console.log("✅ Email verifications indexes created");

		console.log("\n✨ All indexes created successfully!");

		await client.close();
		console.log("✅ Disconnected from MongoDB");
		process.exit(0);
	} catch (error) {
		console.error("❌ Error creating indexes:", error);
		await client.close();
		process.exit(1);
	}
}

createIndexes();
