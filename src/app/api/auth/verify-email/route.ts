import { NextRequest, NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/email-verification";
import { logInfo, logError } from "@/lib/logger";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const token = searchParams.get("token");

		if (!token) {
			return NextResponse.json(
				{ error: "Verification token is required" },
				{ status: 400 },
			);
		}

		const verified = await verifyEmailToken(token);

		if (!verified) {
			return NextResponse.json(
				{ error: "Invalid or expired verification token" },
				{ status: 400 },
			);
		}

		logInfo("Email verified successfully", { token });

		return NextResponse.json({
			success: true,
			message: "Email verified successfully!",
		});
	} catch (error) {
		logError("Email verification error", error);
		return NextResponse.json(
			{ error: "Failed to verify email" },
			{ status: 500 },
		);
	}
}
