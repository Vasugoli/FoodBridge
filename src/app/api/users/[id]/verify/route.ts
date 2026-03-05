/**
 * POST /api/users/[id]/verify
 *
 * Admin-only: verify/unverify/suspend/unsuspend a user.
 * Body: { action: "verify" | "unverify" | "suspend" | "unsuspend" }
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserById, setUserVerified, setUserSuspended } from "@/lib/db";
import { z } from "zod";

const actionSchema = z.object({
	action: z.enum(["verify", "unverify", "suspend", "unsuspend"]),
});

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await getSession();
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const admin = await getUserById(session.id);
		if (!admin || admin.role !== "admin") {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const { id } = await params;
		const target = await getUserById(id);
		if (!target) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Prevent admins from modifying other admins
		if (target.role === "admin") {
			return NextResponse.json({ error: "Cannot modify admin accounts" }, { status: 403 });
		}

		const body = await request.json();
		const parsed = actionSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ error: parsed.error.errors[0]?.message ?? "Invalid action" },
				{ status: 400 },
			);
		}

		const { action } = parsed.data;

		if (action === "verify")   await setUserVerified(id, true);
		if (action === "unverify") await setUserVerified(id, false);
		if (action === "suspend")    await setUserSuspended(id, true);
		if (action === "unsuspend")  await setUserSuspended(id, false);

		return NextResponse.json({ message: `User ${action}d successfully` });
	} catch {
		return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
	}
}
