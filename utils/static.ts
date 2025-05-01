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
	{ id: "title", label: "Title", type: "text", placeholder: "Enter task title", extra: "A clear, concise title for your task." },
	{ id: "description", label: "Description", type: "textarea", placeholder: "Enter task description", extra: "Provide details about what needs to be done." },
	{ id: "dueDate", label: "Due Date", type: "date", placeholder: "Select task due date", extra: "When should this task be completed?" },
	{ id: "priority", label: "Priority", type: "select", placeholder: "Select task priority", extra: "Set the importance level of this task." },
	{ id: "assignees", label: "Assignees", type: "select", placeholder: "Assign task", extra: "Who should work on this task? Leave empty for unassigned.", isMultiple: true },
	{ id: "status", label: "Status", type: "select", placeholder: "Select task status", extra: "Current state of the task." },
];
