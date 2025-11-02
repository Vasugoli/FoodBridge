import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "";

if (!uri) {
	// Intentionally not throwing here so the app can still run using mock data.
	// When you enable MongoDB, set MONGODB_URI in your environment.
	// Example: mongodb://localhost:27017/foodbridge
}

// Use a global variable to preserve the client across module reloads in development
// (Prevents exhausting connections).
let client: MongoClient | undefined;
let clientPromise: Promise<MongoClient> | undefined;

if (!clientPromise) {
	client = new MongoClient(uri);
	clientPromise = client.connect();
}

export async function getClient(): Promise<MongoClient> {
	if (!uri) throw new Error("MONGODB_URI environment variable is not set");
	return clientPromise!;
}

export async function getDb(dbName?: string) {
	const client = await getClient();
	return client.db(dbName);
}

export async function closeClient() {
	if (client) await client.close();
}
