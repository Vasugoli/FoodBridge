import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getUserById } from "@/lib/db";
import { ObjectId } from "mongodb";
import type { Donation } from "@/lib/types";

const DB_NAME = process.env.MONGODB_DB_NAME || "foodbridge";

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
        const resolvedParams = await params;
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

		const id = resolvedParams.id;
		let query: any;
		try {
			query = { $or: [{ _id: new ObjectId(id) }, { id }] };
		} catch {
			query = { id };
		}

		const db = await getDb(DB_NAME);
		const existing = await db
			.collection<Donation>("donations")
			.findOne(query);
		if (!existing) {
			return NextResponse.json(
				{ error: "Donation not found" },
				{ status: 404 }
			);
		}

		// Only donor who created it or admin can edit
		if (!(user.role === "admin" || existing.donor?.id === user.id)) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const body = await request.json();
		const update: any = {};
		if (body.title) update.title = body.title;
		if (body.description) update.description = body.description;
		if (body.quantity) update.quantity = body.quantity;
		if (body.expiry) update.expiry = new Date(body.expiry);
		if (body.location || body.coordinates) {
			update["location.address"] = body.location ?? "";
			if (body.coordinates?.lat != null)
				update["location.lat"] = body.coordinates.lat;
			if (body.coordinates?.lng != null)
				update["location.lng"] = body.coordinates.lng;
		}

		if (Object.keys(update).length === 0) {
			return NextResponse.json(
				{ error: "No updatable fields provided" },
				{ status: 400 }
			);
		}

		await db.collection("donations").updateOne(query, { $set: update });

		return NextResponse.json({ message: "Donation updated" });
	} catch (error) {
		console.error("Error updating donation:", error);
		return NextResponse.json(
			{ error: "Failed to update donation" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
        const resolvedParams = await params;
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

		const id = resolvedParams.id;
		let query: any;
		try {
			query = { $or: [{ _id: new ObjectId(id) }, { id }] };
		} catch {
			query = { id };
		}

		const db = await getDb(DB_NAME);
		const existing = await db
			.collection<Donation>("donations")
			.findOne(query);
		if (!existing) {
			return NextResponse.json(
				{ error: "Donation not found" },
				{ status: 404 }
			);
		}

		// Only donor who created it or admin can delete
		if (!(user.role === "admin" || existing.donor?.id === user.id)) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		await db.collection("donations").deleteOne(query);
		return NextResponse.json({ message: "Donation deleted" });
	} catch (error) {
		console.error("Error deleting donation:", error);
		return NextResponse.json(
			{ error: "Failed to delete donation" },
			{ status: 500 }
		);
	}
}
