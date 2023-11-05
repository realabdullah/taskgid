export {};

declare global {
	interface Task {
		id: string;
		title: string;
		description: string;
		priority: string;
		dateAdded: string;
		dueDate: string;
		status: string;
		task_no: number;
		workspace_id: string;
		user_id: string;
		assigned_to: string[];
	}

	interface member {
		id: string;
		name: string;
	}

	interface Workspace {
		title: string;
		description: string;
		slug: string;
		avatar: string;
		owner: string;
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
}
