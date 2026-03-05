import { z } from "zod";

// Password validation schema - strong requirements
export const passwordSchema = z
	.string()
	.min(12, "Password must be at least 12 characters")
	.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
	.regex(/[a-z]/, "Password must contain at least one lowercase letter")
	.regex(/[0-9]/, "Password must contain at least one number")
	.regex(
		/[^A-Za-z0-9]/,
		"Password must contain at least one special character",
	);

// Email validation
export const emailSchema = z
	.string()
	.email("Invalid email format")
	.min(5, "Email is too short")
	.max(100, "Email is too long")
	.toLowerCase()
	.trim();

// User validation schemas
export const signupSchema = z.object({
	name: z
		.string()
		.min(2, "Name must be at least 2 characters")
		.max(100, "Name is too long")
		.trim(),
	email: emailSchema,
	password: passwordSchema,
	role: z.enum(["donor", "distributor", "admin"], {
		required_error: "Role is required",
		invalid_type_error: "Invalid role",
	}),
});

export const loginSchema = z.object({
	email: emailSchema,
	password: z.string().min(1, "Password is required"),
});

// Donation validation schemas
export const createDonationSchema = z.object({
	title: z
		.string()
		.min(5, "Title must be at least 5 characters")
		.max(100, "Title is too long")
		.trim(),
	description: z
		.string()
		.min(10, "Description must be at least 10 characters")
		.max(500, "Description is too long")
		.trim(),
	quantity: z
		.string()
		.min(1, "Quantity is required")
		.max(50, "Quantity description too long")
		.trim(),
	contactNumber: z.string().optional(),
	expiry: z.coerce.date().refine((date) => date > new Date(), {
		message: "Expiry date must be in the future",
	}),
	coordinates: z.object({
		lat: z.number().min(-90).max(90),
		lng: z.number().min(-180).max(180),
	}),
	location: z.string().max(200).optional(),
	imageUrl: z.string().url().optional(),
	imageHint: z.string().max(100).optional(),
});

export const updateDonationSchema = z.object({
	title: z.string().min(5).max(100).trim().optional(),
	description: z.string().min(10).max(500).trim().optional(),
	quantity: z.string().min(1).max(50).trim().optional(),
	expiry: z.coerce
		.date()
		.refine((date) => date > new Date(), {
			message: "Expiry date must be in the future",
		})
		.optional(),
	coordinates: z
		.object({
			lat: z.number().min(-90).max(90),
			lng: z.number().min(-180).max(180),
		})
		.optional(),
	location: z.string().max(200).optional(),
});

// Pagination schema
export const paginationSchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	cursor: z.string().optional(),
});

// Export types
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateDonationInput = z.infer<typeof createDonationSchema>;
export type UpdateDonationInput = z.infer<typeof updateDonationSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
