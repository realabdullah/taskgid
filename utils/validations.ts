import * as z from "zod";

export const SignupSchema = z.object({
	firstName: z
		.string()
		.min(3, { message: "First name must be at least 3 characters" })
		.max(50, { message: "First name must be less than 50 characters" })
		.regex(/^[a-zA-Z]+$/, { message: "First name should only contain letters" }),

	lastName: z
		.string()
		.min(3, { message: "Last name must be at least 3 characters" })
		.max(50, { message: "Last name must be less than 50 characters" })
		.regex(/^[a-zA-Z]+$/, { message: "Last name should only contain letters" }),

	username: z
		.string()
		.min(3, { message: "Username is required" })
		.max(30, { message: "Username must be less than 30 characters" })
		.regex(/^[a-zA-Z0-9_]+$/, {
			message: "Username must contain only letters, numbers, and underscores",
		}),

	email: z.string().email({ message: "Invalid email address" }).max(100, { message: "Email must be less than 100 characters" }),

	password: z
		.string()
		.min(8, { message: "Password must be at least 8 characters" })
		.max(100, { message: "Password must be less than 100 characters" })
		.regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
		.regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
		.regex(/[0-9]/, { message: "Password must contain at least one number" })
		.regex(/[^a-zA-Z0-9]/, {
			message: "Password must contain at least one special character",
		}),
});

export const LoginSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
	password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

export const PasskeyLoginSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
});

export const ResetPasswordSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }).max(100, { message: "Email must be less than 100 characters" }),
});

export const ResetPasswordConfirmationSchema = z
	.object({
		password: z
			.string()
			.min(8, { message: "Password must be at least 8 characters" })
			.max(100, { message: "Password must be less than 100 characters" })
			.regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
			.regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
			.regex(/[0-9]/, { message: "Password must contain at least one number" })
			.regex(/[^a-zA-Z0-9]/, {
				message: "Password must contain at least one special character",
			}),
		confirmPassword: z.string().min(8, { message: "Confirm Password is required" }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "Passwords do not match",
	});

export const WorkspaceFormSchema = z.object({
	title: z
		.string()
		.min(2, {
			message: "Title must be at least 2 characters.",
		})
		.max(50, {
			message: "Title must not be longer than 50 characters.",
		}),
	description: z.string().min(10).max(200, {
		message: "Description must not be longer than 200 characters.",
	}),
	slug: z
		.string()
		.min(3, {
			message: "Slug must be at least 3 characters.",
		})
		.max(20, {
			message: "Slug must not be longer than 20 characters.",
		})
		.regex(/^[a-zA-Z0-9-]+$/, {
			message: "Slug can only contain letters, numbers, and hyphens.",
		}),
});

export const updateProfileSchema = z.object({
	firstName: z
		.string()
		.min(3, { message: "First name must be at least 3 characters" })
		.max(50, { message: "First name must be less than 50 characters" })
		.regex(/^[a-zA-Z]+$/, { message: "First name should only contain letters" }),

	lastName: z
		.string()
		.min(3, { message: "Last name must be at least 3 characters" })
		.max(50, { message: "Last name must be less than 50 characters" })
		.regex(/^[a-zA-Z]+$/, { message: "Last name should only contain letters" }),

	username: z
		.string()
		.min(3, { message: "Username is required" })
		.max(30, { message: "Username must be less than 30 characters" })
		.regex(/^[a-zA-Z0-9_]+$/, {
			message: "Username must contain only letters, numbers, and underscores",
		}),
	profilePicture: z.string().optional(),
	about: z.string().optional(),
	location: z.string().optional(),
	title: z.string().optional(),
});

export const updateAccountSchema = z
	.object({
		password: z.string().min(8, "Current Password must be at least 8 characters"),
		newPassword: z.string().min(8, "New Password must be at least 8 characters"),
		confirmPassword: z.string().min(8, "Confirm Password must be at least 8 characters"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "Passwords do not match",
	});

export const taskFormSchema = z.object({
	title: z
		.string()
		.min(3, { message: "Title must be at least 3 characters" })
		.max(50, { message: "Title must be less than 50 characters" })
		.regex(/^[a-zA-Z0-9 ]+$/, { message: "Title should only contain letters and numbers" }),
	description: z
		.string()
		.min(10, { message: "Description must be at least 10 characters" })
		.max(200, { message: "Description must be less than 200 characters" })
		.regex(/^[a-zA-Z0-9 ]+$/, { message: "Description should only contain letters and numbers" }),
	dueDate: z.date().optional(),
	priority: z.enum(["high", "medium", "low"]).optional(),
	assignees: z.array(z.string()).optional(),
	status: z.enum(["todo", "in_progress", "done"]).optional(),
});
