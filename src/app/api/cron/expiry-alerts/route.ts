/**
 * POST /api/cron/expiry-alerts
 *
 * Sends expiry alert emails to ALL distributors listing donations that are
 * still available but expire within 6 hours.
 *
 * Intended to be called by a cron job (e.g., Vercel Cron, GitHub Actions,
 * or a simple setInterval scheduler). Secured with CRON_SECRET.
 *
 * Also triggers the expire endpoint to mark already-past donations as expired.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getExpiringSoonDonations, getAllDistributors } from "@/lib/db";
import { sendEmail, EmailTemplates } from "@/lib/email";
import { logInfo, logError } from "@/lib/logger";

export async function POST(request: NextRequest) {
	// Accept either CRON_SECRET bearer token or admin session
	const authHeader = request.headers.get("authorization");
	const cronSecret = process.env.CRON_SECRET;

	let authorised = false;

	if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
		authorised = true;
	} else {
		const session = await getSession();
		if (session?.role === "admin") authorised = true;
	}

	if (!authorised) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		// 1. Find donations expiring within 6 hours
		const expiringDonations = await getExpiringSoonDonations(6);
		if (expiringDonations.length === 0) {
			logInfo("Expiry alerts: no donations expiring soon");
			return NextResponse.json({ message: "No expiring donations", sent: 0 });
		}

		// 2. Build summary list for the email
		const donationSummaries = expiringDonations.map((d) => ({
			title:     d.title,
			address:   (d.location as any)?.address ?? "Unknown location",
			hoursLeft: Math.max(
				0,
				Math.round((new Date(d.expiry).getTime() - Date.now()) / 3_600_000),
			),
		}));

		// 3. Fetch all distributors and email each one
		const distributors = await getAllDistributors();

		let sent = 0;
		await Promise.allSettled(
			distributors.map(async (dist) => {
				if (!dist.email) return;
				try {
					await sendEmail({
						to: dist.email,
						...EmailTemplates.expiryAlert(dist.name, donationSummaries),
					});
					sent++;
				} catch (e) {
					logError(`Failed to send expiry alert to ${dist.email}`, e);
				}
			}),
		);

		// 4. Also run the expire routine to mark past-due donations
		const expireUrl = new URL("/api/donations/expire", request.url);
		fetch(expireUrl.toString(), {
			method:  "POST",
			headers: cronSecret ? { authorization: `Bearer ${cronSecret}` } : {},
		}).catch(() => {}); // fire-and-forget

		logInfo(`Expiry alerts sent to ${sent}/${distributors.length} distributors`);

		return NextResponse.json({
			message:    "Expiry alerts dispatched",
			donations:  expiringDonations.length,
			recipients: sent,
		});
	} catch (error) {
		logError("Expiry alert cron failed", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
