import * as z from "zod";

export const SignupSchema = z.object({
	firstName: z
		.string()
		.min(3, { message: "Enter at least 3 characters for your first name" })
		.max(50, { message: "Use no more than 50 characters for your first name" })
		.regex(/^[a-zA-Z]+$/, { message: "Use only letters for your first name" }),

	lastName: z
		.string()
		.min(3, { message: "Enter at least 3 characters for your last name" })
		.max(50, { message: "Use no more than 50 characters for your last name" })
		.regex(/^[a-zA-Z]+$/, { message: "Use only letters for your last name" }),

	username: z
		.string()
		.min(3, { message: "Enter a username with at least 3 characters" })
		.max(30, { message: "Use no more than 30 characters for your username" })
		.regex(/^[a-zA-Z0-9_]+$/, {
			message: "Use only letters, numbers, and underscores for your username",
		}),

	email: z.string().email({ message: "Enter an email address in the format name@example.com" }).max(100, { message: "Use no more than 100 characters for your email address" }),

	password: z
		.string()
		.min(8, { message: "Use at least 8 characters for your password" })
		.max(100, { message: "Use no more than 100 characters for your password" })
		.regex(/[a-z]/, { message: "Add at least one lowercase letter to your password" })
		.regex(/[A-Z]/, { message: "Add at least one uppercase letter to your password" })
		.regex(/[0-9]/, { message: "Add at least one number to your password" })
		.regex(/[^a-zA-Z0-9]/, {
			message: "Add at least one symbol to your password",
		}),
});

export const LoginSchema = z.object({
	email: z.string().email({ message: "Enter an email address in the format name@example.com" }),
	password: z.string().min(8, { message: "Enter your password using at least 8 characters" }),
});

export const PasskeyLoginSchema = z.object({
	email: z.string().email({ message: "Enter an email address in the format name@example.com" }),
});

export const ResetPasswordSchema = z.object({
	email: z.string().email({ message: "Enter an email address in the format name@example.com" }).max(100, { message: "Use no more than 100 characters for your email address" }),
});

export const ResetPasswordConfirmationSchema = z
	.object({
		password: z
			.string()
			.min(8, { message: "Use at least 8 characters for your password" })
			.max(100, { message: "Use no more than 100 characters for your password" })
			.regex(/[a-z]/, { message: "Add at least one lowercase letter to your password" })
			.regex(/[A-Z]/, { message: "Add at least one uppercase letter to your password" })
			.regex(/[0-9]/, { message: "Add at least one number to your password" })
			.regex(/[^a-zA-Z0-9]/, {
				message: "Add at least one symbol to your password",
			}),
		confirmPassword: z.string().min(8, { message: "Re-enter your new password" }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "Enter the same password in both fields",
	});

export const InviteSchema = z.object({
	workspaceId: z.string().uuid("Select a valid workspace"),
	email: z.string().email("Enter an email address in the format name@example.com").max(100, { message: "Use no more than 100 characters for the email address" }),
	role: z.enum(["member", "admin"]).optional(),
});

export const BulkInviteSchema = z.object({
	emails: z
		.string()
		.min(1, { message: "Enter at least one email address" })
		.refine(
			(val) => {
				const emails = val
					.split(/[\n,]+/)
					.map((e) => e.trim())
					.filter(Boolean);
				return emails.length > 0 && emails.every((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
			},
			{ message: "Enter valid email addresses, separated by commas or one per line" }
		),
	role: z.enum(["member", "admin"]).optional(),
});

export const WorkspaceFormSchema = z.object({
	title: z
		.string()
		.min(2, {
			message: "Enter at least 2 characters for the workspace name",
		})
		.max(50, {
			message: "Use no more than 50 characters for the workspace name",
		}),
	description: z.string().min(10, { message: "Enter at least 10 characters for the workspace description" }).max(200, {
		message: "Use no more than 200 characters for the workspace description",
	}),
	slug: z
		.string()
		.min(3, {
			message: "Enter at least 3 characters for the workspace address",
		})
		.max(20, {
			message: "Use no more than 20 characters for the workspace address",
		})
		.regex(/^[a-zA-Z0-9-]+$/, {
			message: "Use only letters, numbers, and hyphens for the workspace address",
		}),
});

export const updateProfileSchema = z.object({
	firstName: z
		.string()
		.min(3, { message: "Enter at least 3 characters for your first name" })
		.max(50, { message: "Use no more than 50 characters for your first name" })
		.regex(/^[a-zA-Z]+$/, { message: "Use only letters for your first name" }),

	lastName: z
		.string()
		.min(3, { message: "Enter at least 3 characters for your last name" })
		.max(50, { message: "Use no more than 50 characters for your last name" })
		.regex(/^[a-zA-Z]+$/, { message: "Use only letters for your last name" }),

	username: z
		.string()
		.min(3, { message: "Enter a username with at least 3 characters" })
		.max(30, { message: "Use no more than 30 characters for your username" })
		.regex(/^[a-zA-Z0-9_]+$/, {
			message: "Use only letters, numbers, and underscores for your username",
		}),
	profilePicture: z.string().optional(),
	about: z.string().optional(),
	location: z.string().optional(),
	title: z.string().optional(),
});

export const updateAccountSchema = z
	.object({
		currentPassword: z.string().min(8, "Enter your current password using at least 8 characters"),
		newPassword: z.string().min(8, "Use at least 8 characters for your new password"),
		confirmPassword: z.string().min(8, "Re-enter your new password"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "Enter the same password in both new password fields",
	});

export const taskFormSchema = z.object({
	title: z.string().min(3, { message: "Enter at least 3 characters for the task title" }).max(150, { message: "Use no more than 150 characters for the task title" }),
	description: z.string().min(10, { message: "Enter at least 10 characters for the task description" }),
	dueDate: z.date().optional(),
	priority: z.enum(["high", "medium", "low"]).optional(),
	assignees: z.array(z.string()).optional(),
	status: z.enum(["todo", "in_progress", "done"]).optional(),
});
