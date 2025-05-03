export interface Pagination {
	page: number;
	limit: number;
	totalPages: number;
	total: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
}

export interface BaseUser {
	id: string;
	firstName: string;
	lastName: string;
	username: string;
	profilePicture: string;
}

export interface User extends BaseUser {
	email: string;
	title: string | null;
	about: string | null;
	location: string | null;
	workspaceCount: number;
	createdAt: string;
}

export interface PendingInvitation {
	invitationId: string;
	token: string;
	workspaceTitle: string;
	workspaceDescription: string;
	workspaceSlug: string;
	invitedBy: BaseUser;
	invitedAt: string;
	expiresAt: string;
}

export interface Workspace {
	id: string;
	title: string;
	description: string;
	slug: string;
	userId: string;
	createdAt: string;
	updatedAt: string;
	memberCount: number;
	userRole: string;
	owner: string;
	user: BaseUser & { email: string };
}

export interface LoginResponse {
	user: User;
	accessToken: {
		token: string;
		expires: number;
	};
	refreshToken: {
		token: string;
	};
}

export interface SignupResponse {
	user: User;
	accessToken: {
		token: string;
		expiresIn: number;
	};
}

export interface GetWorkspaces {
	data: Workspace[];
	pagination: Pagination;
}

export interface GetAuthnOptions {
	challenge: string;
	rp: { name: string; id: string };
	user: { id: string; name: string; displayName: string };
	pubKeyCredParams: [{ alg: number; type: string }, { alg: number; type: string }, { alg: number; type: string }];
	timeout: number;
	attestation: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	excludeCredentials: Array<any>;
	authenticatorSelection: { userVerification: string; residentKey: string; requireResidentKey: boolean };
	extensions: { credProps: boolean };
}

export interface Passkey {
	id: string;
	device: {
		type: string;
		model: string;
		vendor: string;
	};
	createdAt: string;
}

export interface Task {
	id: string;
	title: string;
	description: string;
	status: "todo" | "in_progress" | "done";
	priority: "low" | "medium" | "high";
	dueDate: string | null;
	workspaceId: string;
	createdById: string;
	createdAt: string;
	updatedAt: string;
	assignees: BaseUser[];
	creator: BaseUser;
	comments?: number;
}

interface TaskStatistics {
	count: number;
	percentage: number;
	completedYesterday?: number;
	movedToDoneYesterday?: number;
	newlyOverdueYesterday?: number;
}

interface StatusBreakdown {
	todo: TaskStatistics;
	in_progress: TaskStatistics;
	done: TaskStatistics;
}

interface PriorityBreakdown {
	low: {
		todo: TaskStatistics;
		in_progress: TaskStatistics;
		done: TaskStatistics;
		total: TaskStatistics;
	};
	medium: {
		todo: TaskStatistics;
		in_progress: TaskStatistics;
		done: TaskStatistics;
		total: TaskStatistics;
	};
	high: {
		todo: TaskStatistics;
		in_progress: TaskStatistics;
		done: TaskStatistics;
		total: TaskStatistics;
	};
}

export interface StatisticsResponse {
	success: boolean;
	statistics: {
		totalTasks: number;
		completedTasks: TaskStatistics;
		inProgressTasks: TaskStatistics;
		overdueTasks: TaskStatistics;
		statusBreakdown: StatusBreakdown;
		priorityBreakdown: PriorityBreakdown;
		memberActivity: {
			assigned: number;
			completed: number;
			percentage: number;
			user: User;
		}[];
		pagination: {
			page: number;
			limit: number;
			totalMembers: number;
		};
	};
}

export interface Team extends BaseUser {
	email: string;
	role: "member" | "creator";
}

export interface ActivityDetails {
	id: string;
	workspaceId: string;
	userId: string;
	action: string;
	details: {
		taskId: string;
		taskTitle: string;
	};
	createdAt: string;
	updatedAt: string;
	user: BaseUser;
}
