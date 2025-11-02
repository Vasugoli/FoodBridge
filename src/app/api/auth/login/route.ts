import { NextResponse } from "next/server";
import { verifyUserPassword } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { email, password } = body;

		// Validate input
		if (!email || !password) {
			return NextResponse.json(
				{ error: "Email and password are required" },
				{ status: 400 }
			);
		}

		// Verify credentials
		const user = await verifyUserPassword(email, password);

		if (!user) {
			return NextResponse.json(
				{ error: "Invalid email or password" },
				{ status: 401 }
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
		console.error("Login error:", error);

		return NextResponse.json(
			{ error: "Failed to log in. Please try again." },
			{ status: 500 }
		);
	}
}
