import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import type { User, Donation } from "@/lib/types";

const DB_NAME = process.env.MONGODB_DB_NAME || "foodbridge";

// ─── Seed credentials (development only) ────────────────────────────────────
const SALT_ROUNDS = 4; // fast in dev

const TEST_USERS = [
	{
		id: "user-seed-admin-001",
		name: "Alex Admin",
		email: "admin@foodbridge.com",
		password: "Admin@1234Dev",
		role: "admin" as const,
		avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin@foodbridge.com",
		trustScore: 5,
		totalRatings: 10,
		emailVerified: true,
	},
	{
		id: "user-seed-donor-001",
		name: "Alice Baker",
		email: "alice@foodbridge.com",
		password: "Donor@1234Dev",
		role: "donor" as const,
		avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice@foodbridge.com",
		trustScore: 4.7,
		totalRatings: 6,
		emailVerified: true,
	},
	{
		id: "user-seed-donor-002",
		name: "Bob Greenway",
		email: "bob@foodbridge.com",
		password: "Donor@1234Dev",
		role: "donor" as const,
		avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob@foodbridge.com",
		trustScore: 4.2,
		totalRatings: 3,
		emailVerified: true,
	},
	{
		id: "user-seed-dist-001",
		name: "City Relief Org",
		email: "relief@foodbridge.com",
		password: "Distrib@1234Dev",
		role: "distributor" as const,
		avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=relief@foodbridge.com",
		trustScore: 4.9,
		totalRatings: 15,
		emailVerified: true,
	},
	{
		id: "user-seed-dist-002",
		name: "Community Kitchen",
		email: "kitchen@foodbridge.com",
		password: "Distrib@1234Dev",
		role: "distributor" as const,
		avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=kitchen@foodbridge.com",
		trustScore: 4.5,
		totalRatings: 8,
		emailVerified: true,
	},
];

function donorRef(user: typeof TEST_USERS[number]) {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
		avatarUrl: user.avatarUrl,
		createdAt: new Date("2025-01-01").toISOString(),
	};
}

function distributorRef(user: typeof TEST_USERS[number]) {
	return donorRef(user);
}

function now(offsetMs = 0) {
	return new Date(Date.now() + offsetMs).toISOString();
}

const DONATIONS: (Omit<Donation, "donor"> & { donor: any; claimedBy?: any })[] = [
	// ── Available ─────────────────────────────────────────────────────────
	{
		id: "don-seed-001",
		title: "Surplus bread from local bakery",
		description: "Mix of whole wheat and sourdough loaves, baked this morning and still perfectly fresh.",
		quantity: "20 loaves",
		status: "available",
		expiry: now(2 * 24 * 60 * 60 * 1000),
		createdAt: now(-1 * 60 * 60 * 1000),
		imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800",
		imageHint: "fresh bread loaves",
		location: { address: "123 Bakery Lane, Los Angeles, CA", lat: 34.0522, lng: -118.2437 },
		donor: null, // filled below
	},
	{
		id: "don-seed-002",
		title: "Fresh vegetables from farmer's market",
		description: "Tomatoes, cucumbers, bell peppers and spinach — surplus from the weekend market.",
		quantity: "5 crates (~30 kg)",
		status: "available",
		expiry: now(1 * 24 * 60 * 60 * 1000),
		createdAt: now(-5 * 60 * 60 * 1000),
		imageUrl: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=800",
		imageHint: "colorful fresh vegetables",
		location: { address: "456 Oak Ave, Los Angeles, CA", lat: 34.055, lng: -118.25 },
		donor: null,
	},
	{
		id: "don-seed-003",
		title: "Catering leftovers — sandwiches & wraps",
		description: "Assorted sandwich platters from a corporate lunch event. Includes vegan and GF options.",
		quantity: "3 large trays (≈ 60 portions)",
		status: "available",
		expiry: now(6 * 60 * 60 * 1000),
		createdAt: now(-45 * 60 * 1000),
		imageUrl: "https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=800",
		imageHint: "sandwich platter catering",
		location: { address: "789 Pine St, Los Angeles, CA", lat: 34.04, lng: -118.26 },
		donor: null,
	},
	{
		id: "don-seed-004",
		title: "Organic milk cartons",
		description: "12 cartons of organic 2% milk. Best-before date is 3 days from now.",
		quantity: "12 × 1L cartons",
		status: "available",
		expiry: now(3 * 24 * 60 * 60 * 1000),
		createdAt: now(-2 * 24 * 60 * 60 * 1000),
		imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800",
		imageHint: "milk carton dairy",
		location: { address: "101 Maple Rd, Los Angeles, CA", lat: 34.06, lng: -118.23 },
		donor: null,
	},
	{
		id: "don-seed-005",
		title: "Cooked rice & curry (restaurant surplus)",
		description: "Leftover basmati rice and vegetable curry prepared fresh today. Sealed containers.",
		quantity: "8 kg rice, 6 L curry",
		status: "available",
		expiry: now(10 * 60 * 60 * 1000),
		createdAt: now(-2 * 60 * 60 * 1000),
		imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
		imageHint: "rice curry indian food",
		location: { address: "22 Spice Blvd, Culver City, CA", lat: 34.021, lng: -118.396 },
		donor: null,
	},
	// ── Claimed ───────────────────────────────────────────────────────────
	{
		id: "don-seed-006",
		title: "Canned goods — mixed variety",
		description: "Beans, corn, tomatoes and chickpeas. Non-expired cans from pantry clear-out.",
		quantity: "40 cans",
		status: "claimed",
		expiry: now(30 * 24 * 60 * 60 * 1000),
		createdAt: now(-3 * 24 * 60 * 60 * 1000),
		imageUrl: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800",
		imageHint: "canned food shelf",
		location: { address: "50 Grove St, Santa Monica, CA", lat: 34.019, lng: -118.491 },
		donor: null,
		claimedBy: distributorRef(TEST_USERS[3]),
	},
	{
		id: "don-seed-007",
		title: "Pastries & croissants",
		description: "End-of-day pastry assortment from a French café. Best eaten same day.",
		quantity: "3 dozen (≈ 36 pieces)",
		status: "claimed",
		expiry: now(4 * 60 * 60 * 1000),
		createdAt: now(-3 * 60 * 60 * 1000),
		imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800",
		imageHint: "croissant pastry cafe",
		location: { address: "88 Cafe Row, Venice, CA", lat: 33.991, lng: -118.472 },
		donor: null,
		claimedBy: distributorRef(TEST_USERS[4]),
	},
	// ── Completed ─────────────────────────────────────────────────────────
	{
		id: "don-seed-008",
		title: "Grocery store surplus — mixed produce",
		description: "Bananas, apples and grapes near sell-by date but perfectly edible.",
		quantity: "10 kg mixed fruit",
		status: "completed",
		expiry: now(-1 * 24 * 60 * 60 * 1000),
		createdAt: now(-5 * 24 * 60 * 60 * 1000),
		imageUrl: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800",
		imageHint: "fruit produce grocery",
		location: { address: "5 Market Plaza, Pasadena, CA", lat: 34.148, lng: -118.144 },
		donor: null,
		claimedBy: distributorRef(TEST_USERS[3]),
	},
	{
		id: "don-seed-009",
		title: "Boxed lunch meals — office surplus",
		description: "Pre-packaged office lunches (wrap + snack + juice) from cancelled meeting.",
		quantity: "25 boxes",
		status: "completed",
		expiry: now(-2 * 24 * 60 * 60 * 1000),
		createdAt: now(-7 * 24 * 60 * 60 * 1000),
		imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
		imageHint: "lunch box healthy meal",
		location: { address: "300 Corporate Dr, Burbank, CA", lat: 34.181, lng: -118.309 },
		donor: null,
		claimedBy: distributorRef(TEST_USERS[4]),
	},
];

// Assign donors to donations
DONATIONS[0].donor = donorRef(TEST_USERS[1]); // Alice
DONATIONS[1].donor = donorRef(TEST_USERS[1]); // Alice
DONATIONS[2].donor = donorRef(TEST_USERS[2]); // Bob
DONATIONS[3].donor = donorRef(TEST_USERS[2]); // Bob
DONATIONS[4].donor = donorRef(TEST_USERS[1]); // Alice
DONATIONS[5].donor = donorRef(TEST_USERS[2]); // Bob
DONATIONS[6].donor = donorRef(TEST_USERS[1]); // Alice
DONATIONS[7].donor = donorRef(TEST_USERS[2]); // Bob
DONATIONS[8].donor = donorRef(TEST_USERS[1]); // Alice

export async function POST() {
	// Safety: only allow in development
	if (process.env.NODE_ENV === "production") {
		return NextResponse.json({ error: "Seeding is not allowed in production." }, { status: 403 });
	}

	try {
		const db = await getDb(DB_NAME);

		// ── 1. Wipe existing seed data ────────────────────────────────────
		await db.collection("users").deleteMany({ id: { $in: TEST_USERS.map((u) => u.id) } });
		await db.collection("donations").deleteMany({ id: { $in: DONATIONS.map((d) => d.id) } });

		// ── 2. Create users ───────────────────────────────────────────────
		const usersToInsert: User[] = await Promise.all(
			TEST_USERS.map(async (u) => ({
				id: u.id,
				name: u.name,
				email: u.email,
				role: u.role,
				avatarUrl: u.avatarUrl,
				passwordHash: await bcrypt.hash(u.password, SALT_ROUNDS),
				createdAt: new Date("2025-01-01"),
				emailVerified: true,
				emailVerifiedAt: new Date("2025-01-01"),
				trustScore: u.trustScore,
				totalRatings: u.totalRatings,
			}))
		);
		await db.collection("users").insertMany(usersToInsert as any[]);

		// ── 3. Create donations ───────────────────────────────────────────
		await db.collection("donations").insertMany(DONATIONS as any[]);

		// ── 4. Return credentials ─────────────────────────────────────────
		const credentials = TEST_USERS.map(({ id, name, email, password, role }) => ({
			id, name, email, password, role,
		}));

		return NextResponse.json({
			ok: true,
			message: "Database seeded successfully.",
			inserted: {
				users: usersToInsert.length,
				donations: DONATIONS.length,
			},
			credentials,
		});
	} catch (err: any) {
		return NextResponse.json(
			{ ok: false, error: err?.message || String(err) },
			{ status: 500 }
		);
	}
}

export async function GET() {
	return NextResponse.json({
		message: "POST to this endpoint to seed the database with test users and donations.",
	});
}

