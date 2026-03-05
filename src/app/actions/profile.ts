"use server";

import { revalidatePath } from "next/cache";
import { getSession, createSession } from "@/lib/auth";
import { updateUserProfile, updateUserPassword, getUserById, verifyUserPassword } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function updateProfileAction(prevState: any, formData: FormData) {
	try {
		const session = await getSession();
		if (!session) {
			return { error: "Not authenticated" };
		}

		const name = formData.get("name") as string;
		const email = formData.get("email") as string;

		if (!name || !email) {
			return { error: "Name and email are required" };
		}

		// Update in DB
		const updatedUser = await updateUserProfile(session.id, name, email);

		// Update session cookie with new info
		await createSession({
			id: updatedUser.id,
			name: updatedUser.name,
			email: updatedUser.email,
			role: updatedUser.role,
			avatarUrl: updatedUser.avatarUrl,
		});

		revalidatePath("/dashboard/profile");
		revalidatePath("/dashboard");

		return { success: "Profile updated successfully!" };
	} catch (error: any) {
		console.error("Profile update error:", error);
		return { error: error.message || "Failed to update profile" };
	}
}

export async function updatePasswordAction(prevState: any, formData: FormData) {
	try {
		const session = await getSession();
		if (!session) {
			return { error: "Not authenticated" };
		}

		const currentPassword = formData.get("currentPassword") as string;
		const newPassword = formData.get("newPassword") as string;

		if (!currentPassword || !newPassword) {
			return { error: "Both current and new passwords are required" };
		}

		// Verify current password
		const validUser = await verifyUserPassword(session.email, currentPassword);
		if (!validUser) {
			return { error: "Invalid current password" };
		}

		// Hash new password
		const newPasswordHash = await bcrypt.hash(newPassword, 10);

		// Update in DB
		await updateUserPassword(session.id, newPasswordHash);

		return { success: "Password updated successfully!" };
	} catch (error: any) {
		console.error("Password update error:", error);
		return { error: error.message || "Failed to update password" };
	}
}
