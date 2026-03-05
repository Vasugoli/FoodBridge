/**
 * POST /api/auth/forgot-password
 *
 * Accepts an email address. If an account exists for that email, a
 * password-reset link is sent.  Always responds with 200 to prevent
 * email-enumeration attacks.
 */
import { NextResponse } from "next/server";
import { createPasswordResetToken } from "@/lib/email-verification";
import { sendEmail, EmailTemplates } from "@/lib/email";
import { forgotPasswordSchema } from "@/lib/validation";
import { checkRateLimit, authRateLimiter, getClientIdentifier } from "@/lib/rate-limit";
import { logError, logInfo } from "@/lib/logger";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9002";

export async function POST(request: Request) {
	try {
		// Rate-limit: max 3 requests per hour per IP
		const identifier = getClientIdentifier(request);
		const rateLimit = await checkRateLimit(identifier, authRateLimiter, 3, 3600000);
		if (!rateLimit.success) {
			return NextResponse.json(
				{ error: "Too many requests. Please try again later." },
				{ status: 429 },
			);
		}

		const body = await request.json();
		const validation = forgotPasswordSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ error: validation.error.errors[0].message },
				{ status: 400 },
			);
		}

		const { email } = validation.data;

		// Create token — returns null if email not found (we don't reveal this)
		const token = await createPasswordResetToken(email);

		if (token) {
			const resetLink = `${APP_URL}/reset-password?token=${token}`;
			// Fetch user name (best-effort — just use email prefix if unavailable)
			const nameGuess = email.split("@")[0];
			await sendEmail({
				to: email,
				...EmailTemplates.passwordReset(nameGuess, resetLink),
			});
			logInfo("Password reset email sent", { email });
		}

		// Always return success to prevent account enumeration
		return NextResponse.json({
			message: "If an account with that email exists, a reset link has been sent.",
		});
	} catch (error) {
		logError("Forgot password error", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
