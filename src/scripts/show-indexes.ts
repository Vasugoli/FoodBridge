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

async function showIndexes() {
	const client = new MongoClient(MONGODB_URI as string);

	try {
		await client.connect();
		console.log("✅ Connected to MongoDB");

		const db = client.db(DB_NAME);

		console.log("\n📊 Current MongoDB Indexes:\n");

		// Users indexes
		console.log("Users collection:");
		const userIndexes = await db.collection("users").indexes();
		userIndexes.forEach((index: any) => {
			console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
		});

		// Donations indexes
		console.log("\nDonations collection:");
		const donationIndexes = await db.collection("donations").indexes();
		donationIndexes.forEach((index: any) => {
			console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
		});

		// Email verifications indexes
		console.log("\nEmail Verifications collection:");
		const verificationIndexes = await db
			.collection("email_verifications")
			.indexes();
		verificationIndexes.forEach((index: any) => {
			console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
		});

		console.log("\n");

		await client.close();
		console.log("✅ Disconnected from MongoDB");
		process.exit(0);
	} catch (error) {
		console.error("Error:", error);
		await client.close();
		process.exit(1);
	}
}

showIndexes();
