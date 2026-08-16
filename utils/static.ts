export const signupFormFields = [
	{ id: "firstName", label: "First name", type: "text", placeholder: "Ada" },
	{ id: "lastName", label: "Last name", type: "text", placeholder: "Lovelace" },
	{ id: "username", label: "Username", type: "text", placeholder: "johndoe" },
	{ id: "email", label: "Email address", type: "email", placeholder: "name@example.com" },
	{ id: "password", label: "Password", type: "password", placeholder: "••••••••" },
];

export const loginFormFields = [
	{ id: "email", label: "Email", type: "email", placeholder: "name@example.com" },
	{ id: "password", label: "Password", type: "password", placeholder: "••••••••" },
];

export const passkeyLoginFormFields = [{ id: "email", label: "Email", type: "email", placeholder: "name@example.com" }];

export const resetConfirmationFields = [
	{ id: "password", label: "Password", type: "password", placeholder: "••••••••" },
	{ id: "confirmPassword", label: "Confirm password", type: "password", placeholder: "••••••••" },
];

export const inviteRoleOptions = [
	{ label: "Member", value: "member" },
	{ label: "Admin", value: "admin" },
];

export const inviteFormFields = [
	{ id: "email", label: "Email address", type: "email", placeholder: "colleague@example.com" },
	{ id: "role", label: "Role", type: "select", placeholder: "Select a role (optional)", options: inviteRoleOptions },
];

export const profileUpdateFields = [
	{ id: "firstName", label: "First name", type: "text", placeholder: "Ada" },
	{ id: "lastName", label: "Last name", type: "text", placeholder: "Lovelace" },
	{ id: "username", label: "Username", type: "text", placeholder: "johndoe" },
	{ id: "about", label: "About", type: "textarea", placeholder: "What should teammates know about you?" },
	{ id: "location", label: "Location", type: "text", placeholder: "Lagos, Nigeria" },
	{ id: "title", label: "Job title", type: "text", placeholder: "Software engineer" },
];

export const updateAccountFields = [
	{ id: "currentPassword", label: "Current password", type: "password", placeholder: "••••••••" },
	{ id: "newPassword", label: "New password", type: "password", placeholder: "••••••••" },
	{ id: "confirmPassword", label: "Confirm new password", type: "password", placeholder: "••••••••" },
];

export const TaskFormFields = [
	{ id: "title", label: "Title", type: "text", placeholder: "Review launch checklist", extra: "Summarize the outcome in a few words.", fullWidth: true },
	{ id: "description", label: "Description", type: "wysiwyg", placeholder: "Add context, links, or acceptance criteria…", extra: "Add the details needed to complete this task.", fullWidth: true },
	{ id: "dueDate", label: "Due date", type: "date", placeholder: "Select a due date", extra: "When should this task be completed?", fullWidth: false },
	{ id: "priority", label: "Priority", type: "select", placeholder: "Select a priority", extra: "How urgently does this task need attention?", fullWidth: false },
	{ id: "assignees", label: "Assignees", type: "select", placeholder: "Select assignees", extra: "Leave this empty to keep the task unassigned.", isMultiple: true, fullWidth: false },
	{ id: "status", label: "Status", type: "select", placeholder: "Select a status", extra: "Where is this task in the workflow?", fullWidth: false },
];

export const taskActions = [
	{ label: "Change status", value: "status", description: "Move the task to a different stage" },
	{ label: "Change priority", value: "priority", description: "Change how urgently the task needs attention" },
	{ label: "Change assignees", value: "assignees", description: "Choose who is responsible for the task" },
	{ label: "Set due date", value: "dueDate", description: "Add or update the task deadline" },
] as const;

export const taskActionsLabelMap = taskActions.reduce(
	(map, action) => {
		map[action.value] = { label: action.label, description: action.description };
		return map;
	},
	{} as Record<string, { label: string; description: string }>
);

export const taskStatuses = [
	{ label: "To do", value: "todo", description: "Tasks waiting to be started." },
	{ label: "In progress", value: "in_progress", description: "Tasks currently being worked on." },
	{ label: "Done", value: "done", description: "Completed tasks." },
];

export const taskPriorities = [
	{ label: "Low", value: "low", description: "Non-urgent task that can be handled in due course." },
	{ label: "Medium", value: "medium", description: "Important task that should be completed soon." },
	{ label: "High", value: "high", description: "Critical task requiring immediate attention." },
];

export const periods = [
	{ label: "This week", value: "week" },
	{ label: "This month", value: "month" },
	{ label: "This quarter", value: "quarter" },
	{ label: "This year", value: "year" },
];
