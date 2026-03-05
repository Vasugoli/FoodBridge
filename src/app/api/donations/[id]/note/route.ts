/**
 * PATCH /api/donations/[id]/note
 *
 * Appends a coordination message to the donation thread. Both the donor and
 * the claiming distributor (and admins) may post messages.
 */
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getSession } from "@/lib/auth";
import { getUserById, addCoordinationMessage, donationIdQuery } from "@/lib/db";
import { getDb } from "@/lib/mongodb";
import type { Donation, CoordinationMessage } from "@/lib/types";
import { z } from "zod";

const noteSchema = z.object({
	message: z.string().min(1, "Message cannot be empty").max(500, "Message must be under 500 characters"),
	// backwards-compat alias
	note: z.string().max(500).optional(),
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
		const donation = await db.collection<Donation>("donations").findOne(donationIdQuery(id));
		if (!donation) {
			return NextResponse.json({ error: "Donation not found" }, { status: 404 });
		}

		// Only donor or claiming distributor (or admin) may write a message
		const isDonor   = (donation as any).donor?.id === user.id;
		const isClaimer = (donation as any).claimedBy?.id === user.id;
		const isAdmin   = user.role === "admin";
		if (!isDonor && !isClaimer && !isAdmin) {
			return NextResponse.json(
				{ error: "Only the donor or the claiming distributor can add a coordination message" },
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

		// Support both { message } and legacy { note }
		const text = parsed.data.message ?? parsed.data.note ?? "";
		if (!text.trim()) {
			return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
		}

		const msg: CoordinationMessage = {
			id:         nanoid(),
			authorId:   user.id,
			authorName: user.name,
			authorRole: user.role,
			message:    text.trim(),
			createdAt:  new Date().toISOString(),
		};

		await addCoordinationMessage(donation.id || id, msg);

		return NextResponse.json({ message: "Message added", coordination: msg });
	} catch (error) {
		return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
	}
}
