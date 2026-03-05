export type UserRole = "donor" | "distributor" | "admin";

export type UrgencyLevel = "critical" | "high" | "medium" | "normal";

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
	ratingAvg?: number;
	isVerified?: boolean;
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
	ratingAvg?: number;
	isVerified?: boolean;
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
	completedAt?: Date | string;
	unclaimedAt?: Date | string;
	pickupNote?: string;          // Short coordination note from donor
	reportCount?: number;         // How many times flagged
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

export interface DonationReport {
	id?: string;
	donationId: string;
	reporterId: string;
	reporterName: string;
	reason: "unsafe" | "misrepresented" | "already_gone" | "other";
	details?: string;
	createdAt: Date | string;
}

// Matching engine types
export interface MatchedDonation extends Donation {
	urgencyLevel: UrgencyLevel;
	urgencyScore: number;       // 0-100
	distanceKm?: number;        // km from distributor (if coords provided)
	hoursUntilExpiry: number;
	priorityRank: number;       // 1 = highest priority
}

// Analytics types
export interface DonationTrend {
	label: string;    // e.g. "Jan" or "Mon"
	donations: number;
	claimed: number;
	completed: number;
}

export interface ImpactMetrics {
	totalDonations: number;
	totalUsers: number;
	donorsCount: number;
	distributorsCount: number;
	availableCount: number;
	claimedCount: number;
	completedCount: number;
	expiredCount: number;
	completionRate: number;     // 0-100
	claimRate: number;          // 0-100
	estimatedMealsSaved: number;
	estimatedCO2Saved: number;  // kg
	avgTimeToClaimHours: number;
	trends: DonationTrend[];    // Last 6 months
}

// SSE event types
export interface SSEEvent {
	type: "donation_claimed" | "donation_completed" | "donation_expired" | "new_donation";
	donationId: string;
	data: Partial<Donation>;
	timestamp: string;
}

// Upload result
export interface UploadResult {
	url: string;
	filename: string;
	size: number;
}
