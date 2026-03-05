/**
 * POST /api/auth/reset-password
 *
 * Accepts { token, password }. Verifies the token, resets the password,
 * and invalidates the token (one-time use).
 */
import { NextResponse } from "next/server";
import { consumePasswordResetToken } from "@/lib/email-verification";
import { resetUserPassword } from "@/lib/db";
import { resetPasswordSchema } from "@/lib/validation";
import { logError, logInfo, logAudit } from "@/lib/logger";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const validation = resetPasswordSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ error: validation.error.errors[0].message },
				{ status: 400 },
			);
		}

		const { token, password } = validation.data;

		// Consume token — verifies validity and marks it used
		const result = await consumePasswordResetToken(token);
		if (!result) {
			return NextResponse.json(
				{ error: "This reset link is invalid or has expired. Please request a new one." },
				{ status: 400 },
			);
		}

		// Reset the password
		await resetUserPassword(result.userId, password);

		logAudit("PASSWORD_RESET", result.userId, { email: result.email });
		logInfo("Password reset successful", { userId: result.userId });

		return NextResponse.json({ message: "Password reset successfully. You can now log in." });
	} catch (error) {
		logError("Reset password error", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
