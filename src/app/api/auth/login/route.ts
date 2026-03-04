import { NextResponse } from "next/server";
import { verifyUserPassword } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import {
	checkRateLimit,
	authRateLimiter,
	getClientIdentifier,
} from "@/lib/rate-limit";
import { logError, logInfo, logAudit } from "@/lib/logger";

export async function POST(request: Request) {
	try {
		// Rate limiting
		const identifier = getClientIdentifier(request);
		const rateLimit = await checkRateLimit(
			identifier,
			authRateLimiter,
			5,
			3600000,
		);

		if (!rateLimit.success) {
			return NextResponse.json(
				{ error: "Too many login attempts. Please try again later." },
				{ status: 429 },
			);
		}

		const body = await request.json();

		// Validate input with Zod
		const validation = loginSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ error: validation.error.errors[0].message },
				{ status: 400 },
			);
		}

		const { email, password } = validation.data;

		// Verify credentials
		const user = await verifyUserPassword(email, password);

		if (!user) {
			logInfo("Failed login attempt", { email, identifier });
			return NextResponse.json(
				{ error: "Invalid email or password" },
				{ status: 401 },
			);
		}

		// Create session
		await createSession({
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			avatarUrl: user.avatarUrl,
		});

		// Audit log
		logAudit("USER_LOGIN", user.id, { email });
		logInfo("User logged in successfully", { userId: user.id, email });

		return NextResponse.json({
			success: true,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				avatarUrl: user.avatarUrl,
			},
		});
	} catch (error: any) {
		logError("Login error", error);

		return NextResponse.json(
			{ error: "Failed to log in. Please try again." },
			{ status: 500 },
		);
	}
}
