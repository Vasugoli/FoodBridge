import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import { resolve } from "path";
import { config } from "dotenv";

// Load environment variables reliably
config({ path: resolve(process.cwd(), ".env.local") });

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error("FATAL: MONGODB_URI is still not found. Check if .env.local exists in FoodBridge folder.");
    process.exit(1);
}

const DB_NAME = process.env.MONGODB_DB_NAME || "foodbridge";

async function seedDatabase() {
    console.log("Connecting manually to MongoDB:", uri.split("@")[1] || "Local/Mock URI");
    const client = new MongoClient(uri as string);
    await client.connect();

    const db = client.db(DB_NAME);

    console.log("Clearing existing data...");
    await db.collection("users").deleteMany({});
    await db.collection("donations").deleteMany({});

    console.log("Generating passwords...");
    const passwordHash = await bcrypt.hash("password123", 10);

    const users = [
		{
			id: "admin-1",
			name: "System Admin",
			email: "admin@foodbridge.com",
			role: "admin",
			avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
			createdAt: new Date(),
			passwordHash,
			trustScore: 4.9,
			totalRatings: 10,
		},
		{
			id: "donor-1",
			name: "Sunshine Bakery",
			email: "bakery@example.com",
			role: "donor",
			avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=bakery",
			createdAt: new Date("2024-01-15T08:00:00Z"),
			passwordHash,
			trustScore: 4.8,
			totalRatings: 45,
		},
		{
			id: "donor-2",
			name: "Green Valley Farms",
			email: "farmer@example.com",
			role: "donor",
			avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=farm",
			createdAt: new Date("2024-02-10T09:30:00Z"),
			passwordHash,
			trustScore: 5.0,
			totalRatings: 12,
		},
		{
			id: "distributor-1",
			name: "Downtown Haven Shelter",
			email: "shelter@example.com",
			role: "distributor",
			avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=shelter",
			createdAt: new Date("2024-01-20T10:00:00Z"),
			passwordHash,
			trustScore: 4.7,
			totalRatings: 38,
		},
		{
			id: "distributor-2",
			name: "Community Food Bank",
			email: "foodbank@example.com",
			role: "distributor",
			avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=foodbank",
			createdAt: new Date("2024-03-01T11:15:00Z"),
			passwordHash,
			trustScore: 4.9,
			totalRatings: 60,
		},
	];

	console.log("Inserting users...");
	await db.collection("users").insertMany(users);

	const now = new Date();
	const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
	const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

	const donations = [
		{
			id: "donation-101",
			title: "End of day artisan bread",
			description: "15 loaves of sourdough and 10 baguettes baked fresh this morning. Perfectly safe to eat, best if frozen or consumed within 2 days.",
			quantity: "25 items",
			expiry: tomorrow,
			location: {
				address: "125 Main St, Los Angeles, CA",
				lat: 34.0522,
				lng: -118.2437,
			},
			imageUrl: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800&auto=format&fit=crop&q=60",
			imageHint: "Fresh Bread Loaves",
			status: "available",
			donor: users[1],
			createdAt: now,
		},
		{
			id: "donation-102",
			title: "Crates of slightly bruised apples",
			description: "3 large crates of apples. They have some minor cosmetic blemishes but are perfect for making applesauce, pies, or juice.",
			quantity: "3 crates (~100 lbs)",
			expiry: nextWeek,
			location: {
				address: "9400 Oak Ave, San Fernando, CA",
				lat: 34.2819,
				lng: -118.4389,
			},
			imageUrl: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&auto=format&fit=crop&q=60",
			imageHint: "Crates of apples",
			status: "available",
			donor: users[2],
			createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
		},
		{
			id: "donation-103",
			title: "Catered event leftovers: Roasted chicken & veggies",
			description: "Unserved, untouched hot trays from a corporate luncheon. Maintained at food-safe temperatures.",
			quantity: "5 large catering trays",
			expiry: tomorrow,
			location: {
				address: "Convention Center Blvd, Los Angeles, CA",
				lat: 34.0403,
				lng: -118.2696,
			},
			imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f40ce88cb?w=800&auto=format&fit=crop&q=60",
			imageHint: "Catering trays of chicken",
			status: "claimed",
			donor: users[1],
			claimedBy: users[3],
			claimedAt: new Date(now.getTime() - 30 * 60 * 1000),
			createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
		}
	];

	console.log("Inserting donations...");
	await db.collection("donations").insertMany(donations);

    console.log("Closing connection...");
    await client.close();

	console.log("Database seeded successfully!");
}

seedDatabase().catch(async (error) => {
	console.error("Error seeding database:", error);
	process.exit(1);
});
