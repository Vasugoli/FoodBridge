/**
 * GET  /api/admin/reports  — list all reports (admin only)
 * POST /api/admin/reports  — take action on a report (unhide / dismiss)
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserById, getAdminReports, unhideDonation } from "@/lib/db";
import { getDb } from "@/lib/mongodb";
import { z } from "zod";

const DB_NAME = process.env.MONGODB_DB_NAME || "foodbridge";

async function requireAdmin() {
	const session = await getSession();
	if (!session) return null;
	const user = await getUserById(session.id);
	if (!user || user.role !== "admin") return null;
	return user;
}

export async function GET() {
	try {
		const admin = await requireAdmin();
		if (!admin) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		const reports = await getAdminReports();
		return NextResponse.json({ reports });
	} catch {
		return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
	}
}

const actionSchema = z.object({
	donationId: z.string().min(1),
	action: z.enum(["unhide", "dismiss"]),
});

export async function POST(request: NextRequest) {
	try {
		const admin = await requireAdmin();
		if (!admin) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const parsed = actionSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ error: parsed.error.errors[0]?.message ?? "Invalid input" },
				{ status: 400 },
			);
		}

		const { donationId, action } = parsed.data;
		const db = await getDb(DB_NAME);

		if (action === "unhide") {
			await unhideDonation(donationId);
		} else if (action === "dismiss") {
			// Remove all reports for this donation
			await db.collection("reports").deleteMany({ donationId });
			// Also reset the reportCount on the donation
			await db.collection("donations").updateOne(
				{ id: donationId },
				{ $set: { reportCount: 0 } },
			);
		}

		return NextResponse.json({ message: `Action '${action}' completed` });
	} catch {
		return NextResponse.json({ error: "Failed to process action" }, { status: 500 });
	}
}
