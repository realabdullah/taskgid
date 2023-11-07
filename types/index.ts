export {};

declare global {
	interface Task {
		_id: string;
		title: string;
		description: string;
		priority: string;
		dueDate: string;
		status: string;
		workspace: string;
		user: {
			username: string;
			name: string;
		};
		assignees: string[];
		createdAt: string;
	}

	interface Team {
		name: string;
		username: string;
		email: string;
		profile_picture: string;
	}

	interface Workspace {
		title: string;
		description: string;
		slug: string;
		avatar: string;
		owner: string;
		team: Team[];
	}

	interface User {
		_id: string;
		firstName: string;
		lastName: string;
		email: string;
		username: string;
		profile_picture: string;
		workspaces: Workspace[];
	}

	interface Toast {
		toastStyle: string;
		type: string;
		message: string;
		description: string;
	}

	interface Token {
		token: string;
		expires: string;
	}

	interface TokenAPIResponse {
		success: boolean;
		accessToken: Token;
		refreshToken: Token;
	}

	interface UserAPiResponse extends TokenAPIResponse {
		user: User;
	}

	interface TaskAPIResponse {
		success: boolean;
		task: Task;
	}

	interface TasksAPIResponse {
		success: boolean;
		tasks: Task[];
	}

	interface TeamsAPIResponse {
		success: boolean;
		team: Team[];
	}
}
