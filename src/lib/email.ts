import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
	? new Resend(process.env.RESEND_API_KEY)
	: null;

// Fallback email service (logs to console in development)
class FallbackEmailService {
	async send(options: EmailOptions) {
		console.log("📧 Email (Development Mode):");
		console.log("To:", options.to);
		console.log("Subject:", options.subject);
		console.log("Content:", options.html || options.text);
		return { id: `dev-${Date.now()}`, success: true };
	}
}

const fallbackService = new FallbackEmailService();

export interface EmailOptions {
	to: string;
	subject: string;
	html?: string;
	text?: string;
}

// Send email using Resend or fallback
export async function sendEmail(options: EmailOptions) {
	try {
		if (resend) {
			const result = await resend.emails.send({
				from:
					process.env.FROM_EMAIL ||
					"FoodBridge <noreply@foodbridge.com>",
				to: options.to,
				subject: options.subject,
				// Resend requires at least one of html/text; spread only defined values
				...(options.html  ? { html: options.html  } : {}),
				...(options.text  ? { text: options.text  } : { text: " " }),
			});
			return { success: true, id: result.data?.id };
		} else {
			// Use fallback in development
			return await fallbackService.send(options);
		}
	} catch (error) {
		console.error("Failed to send email:", error);
		return { success: false, error };
	}
}

// Email templates
export const EmailTemplates = {
	welcome: (name: string) => ({
		subject: "Welcome to FoodBridge!",
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h1 style="color: #10B981;">Welcome to FoodBridge, ${name}!</h1>
				<p>Thank you for joining our mission to reduce food waste and help those in need.</p>
				<p>Get started by posting your first donation or claiming available food in your area.</p>
				<p>Together, we can make a difference!</p>
				<hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
				<p style="color: #6b7280; font-size: 12px;">FoodBridge - Fighting food waste, one meal at a time.</p>
			</div>
		`,
	}),

	emailVerification: (name: string, verificationLink: string) => ({
		subject: "Verify your FoodBridge email",
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h1 style="color: #10B981;">Verify Your Email</h1>
				<p>Hi ${name},</p>
				<p>Please verify your email address by clicking the button below:</p>
				<div style="text-align: center; margin: 30px 0;">
					<a href="${verificationLink}"
					   style="background-color: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
						Verify Email
					</a>
				</div>
				<p>Or copy and paste this link into your browser:</p>
				<p style="color: #6b7280; word-break: break-all;">${verificationLink}</p>
				<p>This link will expire in 24 hours.</p>
				<hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
				<p style="color: #6b7280; font-size: 12px;">If you didn't create an account, please ignore this email.</p>
			</div>
		`,
	}),

	donationPosted: (donorName: string, donationTitle: string) => ({
		subject: "Your donation has been posted!",
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h1 style="color: #10B981;">Donation Posted Successfully!</h1>
				<p>Hi ${donorName},</p>
				<p>Your donation "<strong>${donationTitle}</strong>" has been posted and is now visible to distributors in your area.</p>
				<p>You'll receive a notification when someone claims your donation.</p>
				<p>Thank you for helping reduce food waste!</p>
				<hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
				<p style="color: #6b7280; font-size: 12px;">FoodBridge - Fighting food waste, one meal at a time.</p>
			</div>
		`,
	}),

	donationClaimed: (
		donorName: string,
		donationTitle: string,
		distributorName: string,
	) => ({
		subject: "Your donation has been claimed!",
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h1 style="color: #10B981;">Great News!</h1>
				<p>Hi ${donorName},</p>
				<p>Your donation "<strong>${donationTitle}</strong>" has been claimed by ${distributorName}.</p>
				<p>They will be in touch shortly to coordinate pickup.</p>
				<p>Thank you for making a difference in your community!</p>
				<hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
				<p style="color: #6b7280; font-size: 12px;">FoodBridge - Fighting food waste, one meal at a time.</p>
			</div>
		`,
	}),

	claimConfirmation: (
		distributorName: string,
		donationTitle: string,
		pickupAddress: string,
	) => ({
		subject: "Claim confirmed - Pickup details",
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h1 style="color: #10B981;">Claim Confirmed!</h1>
				<p>Hi ${distributorName},</p>
				<p>You have successfully claimed "<strong>${donationTitle}</strong>".</p>
				<h3>Pickup Details:</h3>
				<p><strong>Address:</strong> ${pickupAddress}</p>
				<p>Please coordinate with the donor for pickup timing.</p>
				<p>Thank you for your service to the community!</p>
				<hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
				<p style="color: #6b7280; font-size: 12px;">FoodBridge - Fighting food waste, one meal at a time.</p>
			</div>
		`,
	}),

	passwordReset: (name: string, resetLink: string) => ({
		subject: "Reset your FoodBridge password",
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h1 style="color: #10B981;">Password Reset Request</h1>
				<p>Hi ${name},</p>
				<p>We received a request to reset your password. Click the button below to create a new password:</p>
				<div style="text-align: center; margin: 30px 0;">
					<a href="${resetLink}"
					   style="background-color: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
						Reset Password
					</a>
				</div>
				<p>Or copy and paste this link into your browser:</p>
				<p style="color: #6b7280; word-break: break-all;">${resetLink}</p>
				<p>This link will expire in 1 hour.</p>
				<p><strong>If you didn't request this, please ignore this email.</strong></p>
				<hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
				<p style="color: #6b7280; font-size: 12px;">FoodBridge - Fighting food waste, one meal at a time.</p>
			</div>
		`,
	}),

  donationExpired: (donorName: string, donationTitle: string) => ({
    subject: "Your donation has expired",
    html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h1 style="color: #EF4444;">Donation Expired</h1>
				<p>Hi ${donorName},</p>
				<p>Unfortunately, your donation "<strong>${donationTitle}</strong>" has passed its expiry date and has been marked as expired.</p>
				<p>No distributor claimed it in time. To help reduce food waste, consider:</p>
				<ul>
					<li>Posting donations with longer lead times</li>
					<li>Re-posting with an updated expiry if the food is still safe</li>
					<li>Contacting local food banks directly for urgent pickups</li>
				</ul>
				<p>Thank you for trying to reduce food waste — every donation counts!</p>
				<hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
				<p style="color: #6b7280; font-size: 12px;">FoodBridge - Fighting food waste, one meal at a time.</p>
			</div>
		`,
  }),

  donationCompleted: (
    donorName: string,
    donationTitle: string,
    distributorName: string,
    estimatedMeals: number,
  ) => ({
    subject: "Donation completed — thank you!",
    html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h1 style="color: #10B981;">Donation Completed! 🎉</h1>
				<p>Hi ${donorName},</p>
				<p>Amazing news! Your donation "<strong>${donationTitle}</strong>" has been successfully picked up and delivered by <strong>${distributorName}</strong>.</p>
				<div style="background: #f0fdf4; border-left: 4px solid #10B981; padding: 16px; margin: 20px 0;">
					<p style="margin: 0; font-weight: bold; color: #065f46;">
						🍽️ Estimated ~${estimatedMeals} meal(s) saved from waste!
					</p>
				</div>
				<p>Your generosity is making a real difference in your community. Thank you!</p>
				<hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
				<p style="color: #6b7280; font-size: 12px;">FoodBridge - Fighting food waste, one meal at a time.</p>
			</div>
		`,
  }),

  expiryAlert: (
    distributorName: string,
    donations: { title: string; hoursLeft: number; address: string }[],
  ) => ({
    subject: `⚠️ ${donations.length} urgent donation(s) expiring soon!`,
    html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h1 style="color: #F59E0B;">Urgent Donations Nearby</h1>
				<p>Hi ${distributorName},</p>
				<p>The following donations are expiring soon and need a pickup:</p>
				${donations
          .map(
            (d) => `
					<div style="border: 1px solid #fbbf24; border-radius: 8px; padding: 12px; margin: 10px 0; background: #fffbeb;">
						<strong>${d.title}</strong><br/>
						📍 ${d.address}<br/>
						⏰ <strong style="color: #dc2626;">~${d.hoursLeft}h remaining</strong>
					</div>`,
          )
          .join("")}
				<div style="text-align: center; margin: 30px 0;">
					<a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/donations"
					   style="background-color: #F59E0B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
						Claim Now
					</a>
				</div>
				<hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
				<p style="color: #6b7280; font-size: 12px;">FoodBridge - Fighting food waste, one meal at a time.</p>
			</div>
		`,
  }),};