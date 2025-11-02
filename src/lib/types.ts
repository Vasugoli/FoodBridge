export type UserRole = "donor" | "distributor" | "admin";

export interface User {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	avatarUrl: string;
	createdAt: Date | string;
	passwordHash?: string; // Only stored in DB, never sent to client
}

export interface UserSession {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	avatarUrl: string;
}

// Serializable version for client components (no Date objects, no passwordHash)
export interface SerializableUser {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	avatarUrl: string;
	createdAt: string;
}

export type DonationStatus = "available" | "claimed" | "completed" | "expired";

export interface Donation {
	id: string;
	title: string;
	description: string;
	quantity: string; // e.g., "10 meals", "2 boxes"
	expiry: Date | string;
	location: {
		address: string;
		lat: number;
		lng: number;
	};
	imageUrl: string;
	imageHint: string;
	status: DonationStatus;
	donor: User | SerializableUser;
	claimedBy?: User | SerializableUser;
	createdAt: Date | string;
}
