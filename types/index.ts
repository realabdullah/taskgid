export interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	username: string;
	profilePicture: string;
	isAdmin: boolean;
	createdAt: string;
}

export interface PendingInvitation {
	invitationId: string;
	token: string;
	workspaceTitle: string;
	workspaceDescription: string;
	workspaceSlug: string;
	invitedBy: Omit<User, "createdAt">;
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
}
