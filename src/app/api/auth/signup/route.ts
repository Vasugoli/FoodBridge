import { NextResponse } from "next/server";
import { createUser } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { signupSchema } from "@/lib/validation";
import {
	checkRateLimit,
	signupRateLimiter,
	getClientIdentifier,
} from "@/lib/rate-limit";
import { sendEmail, EmailTemplates } from "@/lib/email";
import { createEmailVerificationToken } from "@/lib/email-verification";
import { logError, logInfo, logAudit, logWarning } from "@/lib/logger";
import { sanitizeHtml } from "@/lib/utils";

export async function POST(request: Request) {
	try {
		// Rate limiting
		const identifier = getClientIdentifier(request);
		const rateLimit = await checkRateLimit(
			identifier,
			signupRateLimiter,
			3,
			3600000,
		);

		if (!rateLimit.success) {
			logWarning("Rate limit exceeded for signup", { identifier });
			return NextResponse.json(
				{ error: "Too many signup attempts. Please try again later." },
				{ status: 429 },
			);
		}

		const body = await request.json();

		// Validate input with Zod
		const validation = signupSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ error: validation.error.errors[0].message },
				{ status: 400 },
			);
		}

		const { name, email, password, role } = validation.data;

		// Sanitize name to prevent XSS
		const sanitizedName = sanitizeHtml(name);

		// Create user
		const user = await createUser(sanitizedName, email, password, role);

		// Create email verification token
		const verificationToken = await createEmailVerificationToken(
			user.id,
			email,
		);

		// Send verification email
		const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9002"}/verify-email?token=${verificationToken}`;
		await sendEmail({
			to: email,
			...EmailTemplates.emailVerification(
				sanitizedName,
				verificationLink,
			),
		});

		// Send welcome email
		await sendEmail({
			to: email,
			...EmailTemplates.welcome(sanitizedName),
		});

		// Create session
		await createSession({
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			avatarUrl: user.avatarUrl,
		});

		// Audit log
		logAudit("USER_SIGNUP", user.id, { email, role });
		logInfo("User signed up successfully", {
			userId: user.id,
			email,
			role,
		});

		return NextResponse.json({
			success: true,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				avatarUrl: user.avatarUrl,
			},
			message:
				"Account created! Please check your email to verify your account.",
		});
	} catch (error: any) {
		logError("Signup error", error);

		if (error.message === "User with this email already exists") {
			return NextResponse.json({ error: error.message }, { status: 409 });
		}

		return NextResponse.json(
			{ error: "Failed to create account. Please try again." },
			{ status: 500 },
		);
	}
}


