import { NextResponse } from "next/server";
import { createUser } from "@/lib/db";
import { createSession } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { name, email, password, role } = body;

		// Validate input
		if (!name || !email || !password || !role) {
			return NextResponse.json(
				{ error: "All fields are required" },
				{ status: 400 }
			);
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return NextResponse.json(
				{ error: "Invalid email format" },
				{ status: 400 }
			);
		}

		// Validate password length
		if (password.length < 6) {
			return NextResponse.json(
				{ error: "Password must be at least 6 characters long" },
				{ status: 400 }
			);
		}

		// Validate role
		const validRoles: UserRole[] = ["donor", "distributor", "admin"];
		if (!validRoles.includes(role)) {
			return NextResponse.json(
				{ error: "Invalid role" },
				{ status: 400 }
			);
		}

		// Create user
		const user = await createUser(name, email, password, role);

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
		console.error("Signup error:", error);

		if (error.message === "User with this email already exists") {
			return NextResponse.json({ error: error.message }, { status: 409 });
		}

		return NextResponse.json(
			{ error: "Failed to create account. Please try again." },
			{ status: 500 }
		);
	}
}
