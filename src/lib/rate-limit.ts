import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client (fallback to in-memory if not configured)
const redis =
	process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
		? new Redis({
				url: process.env.UPSTASH_REDIS_REST_URL,
				token: process.env.UPSTASH_REDIS_REST_TOKEN,
			})
		: undefined;

// In-memory store as fallback (for development)
class InMemoryStore {
	private counts: Map<string, { count: number; resetAt: number }> = new Map();

	async limit(identifier: string, max: number, window: number) {
		const now = Date.now();
		const key = identifier;
		const stored = this.counts.get(key);

		if (!stored || stored.resetAt < now) {
			this.counts.set(key, { count: 1, resetAt: now + window });
			return {
				success: true,
				limit: max,
				remaining: max - 1,
				reset: now + window,
			};
		}

		if (stored.count >= max) {
			return {
				success: false,
				limit: max,
				remaining: 0,
				reset: stored.resetAt,
			};
		}

		stored.count++;
		return {
			success: true,
			limit: max,
			remaining: max - stored.count,
			reset: stored.resetAt,
		};
	}
}

const inMemoryStore = new InMemoryStore();

// Create rate limiters for different endpoints
export const authRateLimiter = redis
	? new Ratelimit({
			redis,
			limiter: Ratelimit.slidingWindow(5, "1 h"), // 5 requests per hour
			analytics: true,
		})
	: null;

export const signupRateLimiter = redis
	? new Ratelimit({
			redis,
			limiter: Ratelimit.slidingWindow(3, "1 h"), // 3 signups per hour
			analytics: true,
		})
	: null;

export const donationRateLimiter = redis
	? new Ratelimit({
			redis,
			limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 donations per hour
			analytics: true,
		})
	: null;

export const claimRateLimiter = redis
	? new Ratelimit({
			redis,
			limiter: Ratelimit.slidingWindow(20, "1 h"), // 20 claims per hour
			analytics: true,
		})
	: null;

export const generalRateLimiter = redis
	? new Ratelimit({
			redis,
			limiter: Ratelimit.slidingWindow(100, "1 h"), // 100 requests per hour
			analytics: true,
		})
	: null;

// Helper function to check rate limit
export async function checkRateLimit(
	identifier: string,
	limiter: Ratelimit | null,
	fallbackMax: number = 100,
	fallbackWindow: number = 3600000, // 1 hour in ms
) {
	// Bypass rate limit in development mode
	if (process.env.NODE_ENV === "development") {
		return {
			success: true,
			limit: fallbackMax,
			remaining: fallbackMax,
			reset: Date.now() + fallbackWindow,
		};
	}

	if (limiter) {
		return await limiter.limit(identifier);
	}

	// Fallback to in-memory for production without redis
	return await inMemoryStore.limit(identifier, fallbackMax, fallbackWindow);
}

// Get client identifier (IP address)
export function getClientIdentifier(request: Request): string {
	// Try to get real IP from headers
	const forwarded = request.headers.get("x-forwarded-for");
	const realIp = request.headers.get("x-real-ip");

	if (forwarded) {
		return forwarded.split(",")[0].trim();
	}

	if (realIp) {
		return realIp;
	}

	// Fallback to a default (not ideal for production)
	return "unknown";
}
