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
		id: string;
		created_at: string;
		title: string;
		description: string;
		created_by: string;
		members: string[];
		tasks: Task[];
	}

	interface User {
		id: string;
		name: string;
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
}
