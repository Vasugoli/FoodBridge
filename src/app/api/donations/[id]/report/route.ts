/**
 * POST /api/donations/[id]/report
 *
 * Flag a donation as unsafe, misrepresented, or no longer available.
 * Any authenticated user may report once; admins can see all reports.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserById, reportDonation } from "@/lib/db";
import { z } from "zod";
import { logAudit } from "@/lib/logger";

const reportSchema = z.object({
	reason: z.enum(["unsafe", "misrepresented", "already_gone", "other"]),
	details: z.string().max(500).optional(),
});

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id: donationId } = await params;

		const session = await getSession();
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const user = await getUserById(session.id);
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const body = await request.json();
		const parsed = reportSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Invalid input", details: parsed.error.errors },
				{ status: 400 },
			);
		}

		const report = await reportDonation({
			donationId,
			reporterId:   user.id,
			reporterName: user.name,
			reason:       parsed.data.reason,
			details:      parsed.data.details,
		});

		logAudit("DONATION_REPORTED", user.id, { donationId, reason: parsed.data.reason });

		return NextResponse.json({ message: "Report submitted. Admins will review it.", report });
	} catch (error) {
		if (error instanceof Error && error.message.includes("already reported")) {
			return NextResponse.json({ error: error.message }, { status: 409 });
		}
		return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
	}
}
