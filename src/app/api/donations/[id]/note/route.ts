/**
 * PATCH /api/donations/[id]/note
 *
 * Saves a short pickup-coordination note on the donation (e.g. "Ring bell 2B",
 * "Pickup window 2–5 PM"). Only the donor who posted or the distributor who
 * claimed the donation may set the note.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserById, setPickupNote } from "@/lib/db";
import { getDb } from "@/lib/mongodb";
import type { Donation } from "@/lib/types";
import { z } from "zod";

const noteSchema = z.object({
	note: z.string().max(500, "Note must be under 500 characters"),
});

const DB_NAME = process.env.MONGODB_DB_NAME || "foodbridge";

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;

		const session = await getSession();
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const user = await getUserById(session.id);
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const db = await getDb(DB_NAME);
		const donation = await db.collection<Donation>("donations").findOne({ id });
		if (!donation) {
			return NextResponse.json({ error: "Donation not found" }, { status: 404 });
		}

		// Only donor or claiming distributor (or admin) may write a note
		const isDonor       = (donation as any).donor?.id === user.id;
		const isClaimer     = (donation as any).claimedBy?.id === user.id;
		const isAdmin       = user.role === "admin";
		if (!isDonor && !isClaimer && !isAdmin) {
			return NextResponse.json(
				{ error: "Only the donor or the claiming distributor can add a coordination note" },
				{ status: 403 },
			);
		}

		const body = await request.json();
		const parsed = noteSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ error: parsed.error.errors[0]?.message ?? "Invalid input" },
				{ status: 400 },
			);
		}

		await setPickupNote(id, parsed.data.note);

		return NextResponse.json({ message: "Note saved" });
	} catch (error) {
		return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
	}
}
