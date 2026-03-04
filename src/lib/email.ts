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
				html: options.html,
				text: options.text,
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
};
