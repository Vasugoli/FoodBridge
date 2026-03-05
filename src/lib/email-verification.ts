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

// ─────────────────────────────────────────────────────────────────────────────
// Password Reset Tokens
// ─────────────────────────────────────────────────────────────────────────────

const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

/**
 * Creates a secure password-reset token for the user with the given email.
 * Returns the token string, or null if no user with that email exists.
 * Always deletes any previous reset token for this user first.
 */
export async function createPasswordResetToken(email: string): Promise<string | null> {
	const db = await getDb(DB_NAME);
	const user = await db.collection("users").findOne({ email });
	if (!user) return null; // Don't reveal existence of account

	// Invalidate any previous reset tokens for this user
	await db.collection("password_resets").deleteMany({ userId: user.id });

	const token = nanoid(32);
	await db.collection("password_resets").insertOne({
		userId:    user.id,
		token,
		email:     user.email,
		expiresAt: new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS),
		createdAt: new Date(),
	});

	return token;
}

/**
 * Validates a password-reset token and returns the associated user info.
 * Returns null if token is invalid or expired.
 * Does NOT consume (delete) the token — call consumePasswordResetToken after use.
 */
export async function verifyPasswordResetToken(
	token: string,
): Promise<{ userId: string; email: string } | null> {
	const db = await getDb(DB_NAME);
	const record = await db.collection("password_resets").findOne({ token });
	if (!record) return null;
	if (record.expiresAt < new Date()) {
		await db.collection("password_resets").deleteOne({ token });
		return null;
	}
	return { userId: record.userId, email: record.email };
}

/**
 * Validates AND deletes a password-reset token (one-time use).
 * Returns user info on success, null if invalid/expired.
 */
export async function consumePasswordResetToken(
	token: string,
): Promise<{ userId: string; email: string } | null> {
	const result = await verifyPasswordResetToken(token);
	if (result) {
		const db = await getDb(DB_NAME);
		await db.collection("password_resets").deleteOne({ token });
	}
	return result;
}
