import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { UserSession } from "./types";

const SECRET_KEY =
	process.env.JWT_SECRET || "your-secret-key-change-in-production";
const key = new TextEncoder().encode(SECRET_KEY);

export async function encrypt(payload: UserSession) {
	return await new SignJWT({ ...payload } as any)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("7d") // Token expires in 7 days
		.sign(key);
}

export async function decrypt(token: string): Promise<UserSession | null> {
	try {
		const { payload } = await jwtVerify(token, key, {
			algorithms: ["HS256"],
		});
		return payload as unknown as UserSession;
	} catch (error) {
		console.error("Failed to verify token:", error);
		return null;
	}
}

export async function createSession(user: UserSession) {
	const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
	const session = await encrypt(user);
	const cookieStore = await cookies();

	cookieStore.set("session", session, {
		expires,
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
	});
}

export async function getSession(): Promise<UserSession | null> {
	const cookieStore = await cookies();
	const session = cookieStore.get("session")?.value;

	if (!session) return null;

	return await decrypt(session);
}

export async function deleteSession() {
	const cookieStore = await cookies();
	cookieStore.delete("session");
}

export async function updateSession() {
	const session = await getSession();

	if (!session) return;

	// Refresh the session expiration
	await createSession(session);
}
