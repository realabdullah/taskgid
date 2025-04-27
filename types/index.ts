export interface Pagination {
	page: number;
	limit: number;
	totalPages: number;
	total: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
}

export interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	username: string;
	profilePicture: string;
	title: string | null;
	about: string | null;
	location: string | null;
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
	owner: string;
	user: {
		id: string;
		email: string;
		firstName: string;
		lastName: string;
		username: string;
		profilePicture: string;
	};
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
