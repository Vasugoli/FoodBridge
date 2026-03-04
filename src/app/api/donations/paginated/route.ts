import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import {
	getDonationsPaginated,
	getAvailableDonationsPaginated,
	getDonationsByDonorPaginated,
	getDonationsByDistributorPaginated,
} from "@/lib/pagination";
import { paginationSchema } from "@/lib/validation";
import { serializeDonation } from "@/lib/db";
import { logError } from "@/lib/logger";

export async function GET(request: NextRequest) {
	try {
		const session = await getSession();
		if (!session) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 },
			);
		}

		const user = await getUserById(session.id);
		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 },
			);
		}

		// Parse query parameters
		const searchParams = request.nextUrl.searchParams;
		const validation = paginationSchema.safeParse({
			page: searchParams.get("page"),
			limit: searchParams.get("limit"),
		});

		if (!validation.success) {
			return NextResponse.json(
				{ error: validation.error.errors[0].message },
				{ status: 400 },
			);
		}

		const { page, limit } = validation.data;
		let result;

		// Get donations based on user role
		if (user.role === "donor") {
			result = await getDonationsByDonorPaginated(user.id, page, limit);
		} else if (user.role === "distributor") {
			// Distributors see available donations
			result = await getAvailableDonationsPaginated(page, limit);
		} else if (user.role === "admin") {
			// Admins see all donations
			result = await getDonationsPaginated(page, limit);
		} else {
			return NextResponse.json(
				{ error: "Invalid user role" },
				{ status: 403 },
			);
		}

		// Serialize donations
		const serialized = {
			...result,
			data: result.data.map(serializeDonation),
		};

		return NextResponse.json(serialized);
	} catch (error) {
		logError("Error fetching paginated donations", error);
		return NextResponse.json(
			{ error: "Failed to fetch donations" },
			{ status: 500 },
		);
	}
}
