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
	notifications: {
		byUser: (userId: unknown) => `/api/notifications/${toPath(userId)}`,
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
		taskActivities: (slug: unknown, taskId: unknown) => `/workspaces/${toPath(slug)}/tasks/${toPath(taskId)}/activities`,
		taskComments: (slug: unknown, taskId: unknown) => `/workspaces/${toPath(slug)}/tasks/${toPath(taskId)}/comments`,
		taskCommentReplies: (slug: unknown, taskId: unknown, commentId: unknown) => `/workspaces/${toPath(slug)}/tasks/${toPath(taskId)}/comments/${toPath(commentId)}/replies`,
		memberTasks: (slug: unknown, memberId: unknown) => `/workspaces/${toPath(slug)}/members/${toPath(memberId)}/tasks`,
		memberActivities: (slug: unknown, memberId: unknown) => `/workspaces/${toPath(slug)}/members/${toPath(memberId)}/activities`,
		batchAssignTasks: (slug: unknown) => `/workspaces/${toPath(slug)}/tasks/batch-assign`,
	},
} as const;
