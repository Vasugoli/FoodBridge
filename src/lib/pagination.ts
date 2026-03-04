import { getDb } from "./mongodb";
import type { Donation } from "./types";

const DB_NAME = process.env.MONGODB_DB_NAME || "foodbridge";

export interface PaginatedResult<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

export async function getDonationsPaginated(
	page: number = 1,
	limit: number = 20,
	filter: any = {},
): Promise<PaginatedResult<Donation>> {
	const db = await getDb(DB_NAME);

	const skip = (page - 1) * limit;

	// Get total count
	const total = await db.collection("donations").countDocuments(filter);

	// Get paginated data
	const donations = await db
		.collection<Donation>("donations")
		.find(filter)
		.sort({ createdAt: -1 })
		.skip(skip)
		.limit(limit)
		.toArray();

	const totalPages = Math.ceil(total / limit);

	return {
		data: donations,
		pagination: {
			page,
			limit,
			total,
			totalPages,
			hasNext: page < totalPages,
			hasPrev: page > 1,
		},
	};
}

export async function getAvailableDonationsPaginated(
	page: number = 1,
	limit: number = 20,
): Promise<PaginatedResult<Donation>> {
	return getDonationsPaginated(page, limit, { status: "available" });
}

export async function getDonationsByDonorPaginated(
	donorId: string,
	page: number = 1,
	limit: number = 20,
): Promise<PaginatedResult<Donation>> {
	return getDonationsPaginated(page, limit, { "donor.id": donorId });
}

export async function getDonationsByDistributorPaginated(
	distributorId: string,
	page: number = 1,
	limit: number = 20,
): Promise<PaginatedResult<Donation>> {
	return getDonationsPaginated(page, limit, {
		status: "claimed",
		"claimedBy.id": distributorId,
	});
}

// Cursor-based pagination for infinite scroll
export async function getDonationsCursor(
	cursor?: string,
	limit: number = 20,
	filter: any = {},
) {
	const db = await getDb(DB_NAME);

	const query = cursor ? { ...filter, _id: { $lt: cursor } } : filter;

	const donations = await db
		.collection<Donation>("donations")
		.find(query)
		.sort({ _id: -1 })
		.limit(limit + 1)
		.toArray();

	const hasMore = donations.length > limit;
	const data = hasMore ? donations.slice(0, -1) : donations;
	const nextCursor = hasMore ? donations[limit - 1]._id : undefined;

	return {
		data,
		nextCursor,
		hasMore,
	};
}
