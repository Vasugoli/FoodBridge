export type UserRole = "donor" | "distributor" | "admin";

export interface User {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	avatarUrl: string;
	createdAt: Date | string;
	passwordHash?: string; // Only stored in DB, never sent to client
	emailVerified?: boolean;
	emailVerifiedAt?: Date | string;
	trustScore?: number;
	totalRatings?: number;
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
	emailVerified?: boolean;
	emailVerifiedAt?: string;
	trustScore?: number;
	totalRatings?: number;
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
	contactNumber?: string;
	createdAt: Date | string;
}

export interface Review {
	id?: string;
	reviewerId: string;
	reviewerName: string;
	targetUserId: string;
	donationId: string;
	rating: number; // 1-5
	comment?: string;
	createdAt: Date | string;
}
