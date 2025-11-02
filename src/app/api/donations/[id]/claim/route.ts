import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getUserById } from "@/lib/db";
import { ObjectId } from "mongodb";
import type { Donation } from "@/lib/types";

const DB_NAME = process.env.MONGODB_DB_NAME || "foodbridge";

export async function POST(
	_request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getSession();
		if (!session) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const user = await getUserById(session.id);
		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		if (user.role !== "distributor") {
			return NextResponse.json(
				{ error: "Only distributors can claim" },
				{ status: 403 }
			);
		}

		let _id: ObjectId;
		try {
			_id = new ObjectId(params.id);
		} catch {
			return NextResponse.json(
				{ error: "Invalid donation id" },
				{ status: 400 }
			);
		}

		const db = await getDb(DB_NAME);
		const donation = await db
			.collection<Donation>("donations")
			.findOne({ _id });
		if (!donation) {
			return NextResponse.json(
				{ error: "Donation not found" },
				{ status: 404 }
			);
		}

		if (donation.status !== "available") {
			return NextResponse.json(
				{ error: "Donation is not available" },
				{ status: 400 }
			);
		}

		await db.collection("donations").updateOne(
			{ _id },
			{
				$set: {
					status: "claimed",
					claimedBy: user,
					claimedAt: new Date(),
				},
			}
		);

		return NextResponse.json({ message: "Donation claimed" });
	} catch (error) {
		console.error("Error claiming donation:", error);
		return NextResponse.json(
			{ error: "Failed to claim donation" },
			{ status: 500 }
		);
	}
}
