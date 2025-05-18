export const signupFormFields = [
	{ id: "firstName", label: "First Name", type: "text", placeholder: "John" },
	{ id: "lastName", label: "Last Name", type: "text", placeholder: "Doe" },
	{ id: "username", label: "Username", type: "text", placeholder: "johndoe" },
	{ id: "email", label: "Email Address", type: "email", placeholder: "name@example.com" },
	{ id: "password", label: "Password", type: "password", placeholder: "••••••••" },
];

export const loginFormFields = [
	{ id: "email", label: "Email", type: "email", placeholder: "name@example.com" },
	{ id: "password", label: "Password", type: "password", placeholder: "••••••••" },
];

export const passkeyLoginFormFields = [{ id: "email", label: "Email", type: "email", placeholder: "name@example.com" }];

export const resetConfirmationFields = [
	{ id: "password", label: "Password", type: "password", placeholder: "••••••••" },
	{ id: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "••••••••" },
];

export const inviteFormFields = [{ id: "email", label: "Email Address", type: "email", placeholder: "colleague@example.com" }];

export const profileUpdateFields = [
	{ id: "firstName", label: "First Name", type: "text", placeholder: "John" },
	{ id: "lastName", label: "Last Name", type: "text", placeholder: "Doe" },
	{ id: "username", label: "Username", type: "text", placeholder: "johndoe" },
	{ id: "about", label: "About", type: "textarea", placeholder: "Tell us about yourself" },
	{ id: "location", label: "Location", type: "text", placeholder: "City, Country" },
	{ id: "title", label: "Title", type: "text", placeholder: "Software Engineer" },
];

export const updateAccountFields = [
	{ id: "password", label: "Current Password", type: "password", placeholder: "••••••••" },
	{ id: "newPassword", label: "New Password", type: "password", placeholder: "••••••••" },
	{ id: "confirmPassword", label: "Confirm New Password", type: "password", placeholder: "••••••••" },
];

export const TaskFormFields = [
	{ id: "title", label: "Title", type: "text", placeholder: "Enter task title", extra: "A clear, concise title for your task.", fullWidth: true },
	{ id: "description", label: "Description", type: "textarea", placeholder: "Enter task description", extra: "Provide details about what needs to be done.", fullWidth: true },
	{ id: "dueDate", label: "Due Date", type: "date", placeholder: "Select task due date", extra: "When should this task be completed?", fullWidth: false },
	{ id: "priority", label: "Priority", type: "select", placeholder: "Select task priority", extra: "Set the importance level of this task.", fullWidth: false },
	{ id: "assignees", label: "Assignees", type: "select", placeholder: "Assign task", extra: "Who should work on this task? Leave empty for unassigned.", isMultiple: true, fullWidth: false },
	{ id: "status", label: "Status", type: "select", placeholder: "Select task status", extra: "Current state of the task.", fullWidth: false },
];

export const taskActions = [
	{ label: "Change Status", value: "status", description: "Modify the current state of the task" },
	{ label: "Change Priority", value: "priority", description: "Adjust how urgent or important the task is" },
	{ label: "Assign to Someone Else", value: "assignees", description: "Reassign the task to a different team member" },
	{ label: "Set Due Date", value: "dueDate", description: "Specify or update the task’s deadline" },
] as const;

export const taskActionsLabelMap = taskActions.reduce(
	(map, action) => {
		map[action.value] = { label: action.label, description: action.description };
		return map;
	},
	{} as Record<string, { label: string; description: string }>
);

export const taskStatuses = [
	{ label: "Todo", value: "todo", description: "Tasks that are queued up and waiting to be started." },
	{ label: "In Progress", value: "in_progress", description: "Tasks currently being worked on." },
	{ label: "Done", value: "done", description: "Tasks that have been completed." },
];

export const taskPriorities = [
	{ label: "Low", value: "low", description: "Non-urgent task that can be handled in due course." },
	{ label: "Medium", value: "medium", description: "Important task that should be completed soon." },
	{ label: "High", value: "high", description: "Critical task requiring immediate attention." },
];

export const periods = [
	{ label: "This Week", value: "week" },
	{ label: "This Month", value: "month" },
	{ label: "This Quarter", value: "quarter" },
	{ label: "This Year", value: "year" },
];
