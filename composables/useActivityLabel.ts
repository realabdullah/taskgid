/* eslint-disable @typescript-eslint/no-explicit-any */

export const useActivityLabel = () => {
	const actionMap: Record<string, (user: string, details: any) => string> = {
		task_created: (user) => `${user} created a task`,
		task_updated: (user) => `${user} updated a task`,
		task_deleted: (user) => `${user} deleted a task`,
		task_assigned: (user) => `${user} was assigned to a task`,
		task_unassigned: (user) => `${user} was unassigned from a task`,
		member_invited: (user) => `${user} invited a member`,
		member_joined: (user) => `${user} joined the workspace`,
		member_removed: (user) => `${user} removed a member`,
		member_promoted: (user) => `${user} was promoted`,
		member_demoted: (user) => `${user} was demoted`,
		workspace_created: (user) => `${user} created the workspace`,
		workspace_updated: (user) => `${user} updated the workspace`,
		workspace_deleted: (user) => `${user} deleted the workspace`,
	};

	const getLabel = (entry: any): string => {
		const user = `${entry.user?.firstName ?? ""} ${entry.user?.lastName ?? ""}`.trim();
		const fn = actionMap[entry.action];
		return fn ? fn(user, entry.details) : `${user} performed an action`;
	};

	const secondaryText = (activity: any) => {
		const { taskTitle } = activity.details || {};
		const verb = activity.action.includes("created") || activity.action.includes("assigned") ? "Created" : "Completed";
		return taskTitle ? `${verb} task "${taskTitle}"` : "";
	};

	return { getLabel, secondaryText };
};
