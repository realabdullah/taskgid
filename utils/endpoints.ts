const toPath = (value: unknown) => encodeURIComponent(String(value ?? ""));

export const API_ENDPOINTS = {
	auth: {
		login: "/auth/login",
		register: "/auth/register",
		logout: "/auth/logout",
		forgotPassword: "/auth/forgot-password",
		resetPassword: "/auth/reset-password",
		changePassword: "/auth/change-password",
		passkeyRequestLogin: "/auth/authn/request-login",
		passkeyLogin: "/auth/authn/login",
	},
	users: {
		profile: "/users/profile",
		authn: "/users/authn",
		authnById: (id: unknown) => `/users/authn/${toPath(id)}`,
		authnOptions: "/users/authn/options",
		authnVerify: "/users/authn/verify",
	},
	invites: {
		base: "/invite",
		pending: "/invite/pending",
		accept: "/invite/accept",
		decline: "/invite/decline",
		bulk: "/invites/bulk",
	},
	pusher: {
		auth: "/api/pusher/auth",
	},
	notifications: {
		byUser: (userId: unknown) => `/api/notifications/${toPath(userId)}`,
		preferences: "/api/notifications/preferences",
		workspacePreferences: (slug: unknown) => `/api/notifications/preferences/${toPath(slug)}`,
	},
	media: {
		upload: "/media/upload",
	},
	workspaces: {
		base: "/workspaces",
		bySlug: (slug: unknown) => `/workspaces/${toPath(slug)}`,
		statistics: (slug: unknown) => `/workspaces/${toPath(slug)}/statistics`,
		activities: (slug: unknown) => `/workspaces/${toPath(slug)}/activities`,
		team: (slug: unknown) => `/workspaces/${toPath(slug)}/team`,
		teamComprehensive: (slug: unknown) => `/workspaces/${toPath(slug)}/team/comprehensive`,
		teamStatistics: (slug: unknown, period: unknown) => `/workspaces/${toPath(slug)}/team/statistics?period=${toPath(period)}`,
		tasks: (slug: unknown) => `/workspaces/${toPath(slug)}/tasks`,
		taskById: (slug: unknown, taskId: unknown) => `/workspaces/${toPath(slug)}/tasks/${toPath(taskId)}`,
		taskRead: (slug: unknown, taskId: unknown) => `/workspaces/${toPath(slug)}/tasks/${toPath(taskId)}/read`,
		taskActivities: (slug: unknown, taskId: unknown) => `/workspaces/${toPath(slug)}/tasks/${toPath(taskId)}/activities`,
		taskComments: (slug: unknown, taskId: unknown) => `/workspaces/${toPath(slug)}/tasks/${toPath(taskId)}/comments`,
		taskCommentReplies: (slug: unknown, taskId: unknown, commentId: unknown) => `/workspaces/${toPath(slug)}/tasks/${toPath(taskId)}/comments/${toPath(commentId)}/replies`,
		memberTasks: (slug: unknown, memberId: unknown) => `/workspaces/${toPath(slug)}/members/${toPath(memberId)}/tasks`,
		memberActivities: (slug: unknown, memberId: unknown) => `/workspaces/${toPath(slug)}/members/${toPath(memberId)}/activities`,
		batchAssignTasks: (slug: unknown) => `/workspaces/${toPath(slug)}/tasks/batch-assign`,
		taskSearch: (slug: unknown) => `/workspaces/${toPath(slug)}/tasks/search`,
		taskExport: (slug: unknown, format: "csv" | "pdf") => `/workspaces/${toPath(slug)}/tasks/export/${format}`,
		taskCommentLike: (slug: unknown, taskId: unknown, commentId: unknown) => `/workspaces/${toPath(slug)}/tasks/${toPath(taskId)}/comments/${toPath(commentId)}/like`,
		events: (slug: unknown) => `/workspaces/${toPath(slug)}/events`,
		tags: (slug: unknown) => `/workspaces/${toPath(slug)}/tags`,
		tagById: (slug: unknown, tagId: unknown) => `/workspaces/${toPath(slug)}/tags/${toPath(tagId)}`,
		recurrences: (slug: unknown) => `/workspaces/${toPath(slug)}/recurrences`,
		recurrenceById: (slug: unknown, recurrenceId: unknown) => `/workspaces/${toPath(slug)}/recurrences/${toPath(recurrenceId)}`,
	},
	/**
	 * Attachments are mounted at `/attachments`, and the router inside it repeats
	 * the workspace segment — hence the doubled prefix on the delete path.
	 */
	attachments: {
		forTask: (slug: unknown, taskId: unknown) => `/attachments/workspaces/${toPath(slug)}/tasks/${toPath(taskId)}/attachments`,
		forComment: (slug: unknown, commentId: unknown) => `/attachments/workspaces/${toPath(slug)}/comments/${toPath(commentId)}/attachments`,
		byId: (attachmentId: unknown) => `/attachments/attachments/${toPath(attachmentId)}`,
	},
} as const;
