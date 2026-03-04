import { getDb } from "./mongodb";
import { nanoid } from "nanoid";

const DB_NAME = process.env.MONGODB_DB_NAME || "foodbridge";

export interface EmailVerification {
	userId: string;
	token: string;
	email: string;
	expiresAt: Date;
	createdAt: Date;
}

// Create email verification token
export async function createEmailVerificationToken(
	userId: string,
	email: string,
): Promise<string> {
	const db = await getDb(DB_NAME);
	const token = nanoid(32);
	const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

	const verification: EmailVerification = {
		userId,
		token,
		email,
		expiresAt,
		createdAt: new Date(),
	};

	await db.collection("email_verifications").insertOne(verification);

	return token;
}

// Verify email token
export async function verifyEmailToken(token: string): Promise<boolean> {
	const db = await getDb(DB_NAME);

	const verification = await db
		.collection<EmailVerification>("email_verifications")
		.findOne({ token });

	if (!verification) {
		return false;
	}

	if (verification.expiresAt < new Date()) {
		// Token expired
		await db.collection("email_verifications").deleteOne({ token });
		return false;
	}

	// Mark user as verified
	await db
		.collection("users")
		.updateOne(
			{ id: verification.userId },
			{ $set: { emailVerified: true, emailVerifiedAt: new Date() } },
		);

	// Delete used token
	await db.collection("email_verifications").deleteOne({ token });

	return true;
}

// Check if user email is verified
export async function isEmailVerified(userId: string): Promise<boolean> {
	const db = await getDb(DB_NAME);
	const user = await db.collection("users").findOne({ id: userId });
	return user?.emailVerified === true;
}

// Resend verification email
export async function resendVerificationEmail(email: string): Promise<boolean> {
	const db = await getDb(DB_NAME);
	const user = await db.collection("users").findOne({ email });

	if (!user) {
		return false;
	}

	if (user.emailVerified) {
		return false; // Already verified
	}

	// Delete old tokens for this user
	await db.collection("email_verifications").deleteMany({ userId: user.id });

	// Token will be created by the calling function
	return true;
}
