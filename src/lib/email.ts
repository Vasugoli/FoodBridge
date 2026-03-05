import nodemailer from "nodemailer";

// Configure the nodemailer transporter
const transporter = process.env.SMTP_HOST
	? nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: parseInt(process.env.SMTP_PORT || "587"),
			secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASSWORD,
			},
	  })
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

// Send email using Nodemailer or fallback
export async function sendEmail(options: EmailOptions) {
	try {
		if (transporter) {
			const info = await transporter.sendMail({
				from:
					process.env.FROM_EMAIL ||
					"FoodBridge <noreply@foodbridge.com>",
				to: options.to,
				subject: options.subject,
				html: options.html,
				text: options.text,
			});
			return { success: true, id: info.messageId };
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
		    <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
				<p style="color: #6b7280; font-size: 12px;">FoodBridge - Fighting food waste, one meal at a time.</p>
			</div>
		`,
	}),

	newDonationAvailable: (distributorName: string, donorName: string, donationTitle: string, dashboardLink: string) => ({
		subject: "New Food Donation Available nearby!",
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h1 style="color: #10B981;">New Donation Alert!</h1>
				<p>Hi ${distributorName},</p>
				<p><strong>${donorName}</strong> just posted a new donation: "<strong>${donationTitle}</strong>".</p>
				<p>Log in to your dashboard to claim it before someone else does!</p>
				<div style="text-align: center; margin: 30px 0;">
					<a href="${dashboardLink}"
					   style="background-color: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
						View Dashboard
					</a>
				</div>
				<hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
				<p style="color: #6b7280; font-size: 12px;">FoodBridge - Fighting food waste, one meal at a time.</p>
			</div>
		`,
	}),

	donationClaimed: (
		donorName: string,
		donationTitle: string,
		distributorName: string,
		distributorEmail: string,
	) => ({
		subject: "Your donation has been claimed!",
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h1 style="color: #10B981;">Great News!</h1>
				<p>Hi ${donorName},</p>
				<p>Your donation "<strong>${donationTitle}</strong>" has been claimed by ${distributorName}.</p>
				<div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
					<h3 style="margin-top: 0; color: #374151;">Distributor Contact Info:</h3>
					<p style="margin: 0;"><strong>Name:</strong> ${distributorName}</p>
					<p style="margin: 5px 0 0 0;"><strong>Email:</strong> <a href="mailto:${distributorEmail}" style="color: #10B981;">${distributorEmail}</a></p>
				</div>
				<p>They will be in touch shortly to coordinate pickup. Thank you for making a difference in your community!</p>
				<hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
				<p style="color: #6b7280; font-size: 12px;">FoodBridge - Fighting food waste, one meal at a time.</p>
			</div>
		`,
	}),

	claimConfirmation: (
		distributorName: string,
		donationTitle: string,
		pickupAddress: string,
		donorEmail: string,
		donorPhone?: string,
	) => ({
		subject: "Claim confirmed - Pickup details",
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h1 style="color: #10B981;">Claim Confirmed!</h1>
				<p>Hi ${distributorName},</p>
				<p>You have successfully claimed "<strong>${donationTitle}</strong>".</p>
				<div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
					<h3 style="margin-top: 0; color: #374151;">Pickup Details:</h3>
					<p style="margin: 0 0 10px 0;"><strong>Address:</strong> ${pickupAddress}</p>
					<h3 style="margin-top: 15px; margin-bottom: 5px; color: #374151;">Donor Contact Info:</h3>
					<p style="margin: 0;"><strong>Email:</strong> <a href="mailto:${donorEmail}" style="color: #10B981;">${donorEmail}</a></p>
					${donorPhone ? `<p style="margin: 5px 0 0 0;"><strong>Phone:</strong> <a href="tel:${donorPhone}" style="color: #10B981;">${donorPhone}</a></p>` : ''}
				</div>
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
