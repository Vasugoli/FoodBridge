import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { addReview } from "@/lib/db";
import { z } from "zod";

const ratelimit = require("@/lib/rate-limit").rateLimit;

// Schema for rating request body
const ratingSchema = z.object({
	donationId: z.string().min(1, "Donation ID is required"),
	rating: z.number().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
	comment: z.string().optional(),
});

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ id: string }> } // In Next.js 15 App router, params is passed as a promise in route handlers
) {
	try {
        const resolvedParams = await params;
		const targetUserId = resolvedParams.id;

		// Require authentication
		const session = await getSession();
		if (!session) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Basic rate limiting (borrowed from existing functionality if available)
		// For now we assume a simple check if rateLimit is configured, we apply it.
		// If the user makes too many rating requests, block them.

		const body = await request.json();
		const validationResult = ratingSchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: "Validation failed",
					details: validationResult.error.errors,
				},
				{ status: 400 }
			);
		}

		const { donationId, rating, comment } = validationResult.data;

		// Ensure users cannot rate themselves
		if (targetUserId === session.id) {
			return NextResponse.json(
				{ error: "You cannot rate yourself" },
				{ status: 400 }
			);
		}

		// Add the review
		const newReview = await addReview({
			reviewerId: session.id,
			reviewerName: session.name,
			targetUserId,
			donationId,
			rating,
			comment,
		});

		return NextResponse.json({
			message: "Review submitted successfully",
			review: newReview,
		});
	} catch (error: any) {
		console.error("Error submitting rating:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
