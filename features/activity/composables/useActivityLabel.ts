/* eslint-disable @typescript-eslint/no-explicit-any */
export const useActivityLabel = () => {
	const getUserName = (user: any): string => {
		if (!user) return "Someone";
		const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
		return name || user.username || user.email || "Someone";
	};

	const getTargetUserName = (details: any, keyPrefix: string): string => {
		const name = details?.[`${keyPrefix}UserName`];
		const email = details?.[`${keyPrefix}UserEmail`];
		const id = details?.[`${keyPrefix}UserId`];
		if (Array.isArray(id) && id.length > 1) return `${id.length} users`;
		if (Array.isArray(id) && id.length === 1) return name || email || `User ID ${id[0]}`;
		return name || email || (id ? `User ID ${id}` : "someone");
	};

	const formatChangesToList = (changes: any): string[] => {
		if (!changes || typeof changes !== "object" || Object.keys(changes).length === 0) {
			return [];
		}

		return Object.entries(changes).map(([key, value]: [string, any]) => {
			const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);

			if (value && typeof value === "object" && value.from !== undefined && value.to !== undefined) {
				let fromValStr;
				let toValStr;

				if (key.toLowerCase().includes("date")) {
					fromValStr = value.from ? formatDate(value.from, "MMMM D, YYYY hh:mmA") : "nothing";
					toValStr = value.to ? formatDate(value.to, "MMMM D, YYYY hh:mmA") : "nothing";
				} else {
					fromValStr = typeof value.from === "string" && value.from !== "" ? `'${value.from}'` : (value.from ?? "nothing");
					toValStr = typeof value.to === "string" && value.to !== "" ? `'${value.to}'` : (value.to ?? "nothing");
				}
				return `${formattedKey} from ${fromValStr} to ${toValStr}`;
			} else {
				return `${formattedKey} set to '${value}'`;
			}
		});
	};

	const labelActionMap: Record<string, (actorName: string, details: any) => string> = {
		created: (actorName) => `${actorName} created a task`,
		updated: (actorName) => `${actorName} updated a task`,
		status_changed: (actorName, details) => {
			const doneStatuses = ["done", "completed", "closed"];
			const toStatus = details?.changeDetails?.to?.toLowerCase();
			const verb = toStatus && doneStatuses.includes(toStatus) ? "completed" : "updated status for";
			return `${actorName} ${verb} a task`;
		},
		priority_changed: (actorName) => `${actorName} changed priority for a task`,
		assigned: (actorName) => `${actorName} assigned a user to a task`,
		unassigned: (actorName) => `${actorName} unassigned a user from a task`,
		comment_added: (actorName) => `${actorName} commented on a task`,
		attachment_added: (actorName) => `${actorName} added an attachment to a task`,
		deleted: (actorName) => `${actorName} deleted a task`,
		workspace_created: (actorName) => `${actorName} created the workspace`,
		workspace_updated: (actorName) => `${actorName} updated the workspace`,
		workspace_deleted: (actorName) => `${actorName} deleted the workspace`,
		member_invited: (actorName) => `${actorName} invited a member`,
		member_joined: (actorName) => `${actorName} joined the workspace`,
		member_removed: (actorName) => `${actorName} removed a member`,
		member_promoted: (actorName) => `${actorName} promoted a member`,
		member_demoted: (actorName) => `${actorName} demoted a member`,
		task_created: (actorName) => `${actorName} created a task`,
		task_updated: (actorName) => `${actorName} updated a task`,
		task_deleted: (actorName) => `${actorName} deleted a task`,
		task_assigned: (actorName) => `${actorName} assigned a user to a task`,
		task_unassigned: (actorName) => `${actorName} unassigned a user from a task`,
	};

	const descriptionActionMap: Record<string, (details?: any) => string | null> = {
		created: (details) => {
			const taskTitle = details?.taskTitle ? `"${details.taskTitle}"` : "this task";
			const workspaceCtx = details?.workspaceName ? ` in workspace '${details.workspaceName}'` : "";
			return `Created task ${taskTitle}${workspaceCtx}`;
		},
		updated: (details) => {
			const taskTitle = details?.taskTitle ? `"${details.taskTitle}"` : "this task";
			const changes = details?.changes;
			const workspaceCtx = details?.workspaceName ? ` in workspace '${details.workspaceName}'` : "";
			const changeList = changes ? formatChangesToList(changes) : [];

			if (changeList.length > 1) {
				const listItems = changeList.map((change) => `<li class="max-w-2xl">${change}</li>`).join("");
				return `<p>Updated task ${taskTitle}${workspaceCtx}: <ul class="pl-4 pt-3 list-disc">${listItems}</ul></p>`;
			} else if (changeList.length === 1) {
				return `Updated task ${taskTitle}: ${changeList[0]}${workspaceCtx}`;
			} else {
				return `Updated task ${taskTitle}${workspaceCtx}`;
			}
		},
		status_changed: (details) => {
			const taskTitle = details?.taskTitle ? `"${details.taskTitle}"` : "this task";
			const fromStatus = details?.changeDetails?.from ?? "N/A";
			const toStatus = details?.changeDetails?.to ?? "N/A";
			const workspaceCtx = details?.workspaceName ? ` in workspace '${details.workspaceName}'` : "";
			const doneStatuses = ["done", "completed", "closed"];
			const verb = toStatus && doneStatuses.includes(toStatus.toLowerCase()) ? "Completed" : "Changed status for";
			return `${verb} task ${taskTitle} from '${fromStatus}' to '${toStatus}'${workspaceCtx}`;
		},
		priority_changed: (details) => {
			const taskTitle = details?.taskTitle ? `"${details.taskTitle}"` : "this task";
			const fromPriority = details?.changeDetails?.from ?? "N/A";
			const toPriority = details?.changeDetails?.to ?? "N/A";
			const workspaceCtx = details?.workspaceName ? ` in workspace '${details.workspaceName}'` : "";
			return `Changed priority for task ${taskTitle} from '${fromPriority}' to '${toPriority}'${workspaceCtx}`;
		},
		assigned: (details) => {
			const targetName = getTargetUserName(details, "addedAssignee");
			const taskTitle = details?.taskTitle ? `"${details.taskTitle}"` : "this task";
			const workspaceCtx = details?.workspaceName ? ` in workspace '${details.workspaceName}'` : "";
			return `Assigned ${targetName} to task ${taskTitle}${workspaceCtx}`;
		},
		unassigned: (details) => {
			const targetName = getTargetUserName(details, "removedAssignee");
			const taskTitle = details?.taskTitle ? `"${details.taskTitle}"` : "this task";
			const workspaceCtx = details?.workspaceName ? ` in workspace '${details.workspaceName}'` : "";
			return `Unassigned ${targetName} from task ${taskTitle}${workspaceCtx}`;
		},
		comment_added: (details) => {
			const taskTitle = details?.taskTitle ? `"${details.taskTitle}"` : "this task";
			const workspaceCtx = details?.workspaceName ? ` in workspace '${details.workspaceName}'` : "";
			return `Added comment to task ${taskTitle}${workspaceCtx}`;
		},
		attachment_added: (details) => {
			const taskTitle = details?.taskTitle ? `"${details.taskTitle}"` : "this task";
			const workspaceCtx = details?.workspaceName ? ` in workspace '${details.workspaceName}'` : "";
			return `Added attachment to task ${taskTitle}${workspaceCtx}`;
		},
		deleted: (details) => {
			const taskTitle = details?.taskTitle ? `"${details.taskTitle}"` : "the task";
			const workspaceCtx = details?.workspaceName ? ` in workspace '${details.workspaceName}'` : "";
			return `Deleted task ${taskTitle}${workspaceCtx}`;
		},
		workspace_created: (details) => (details?.workspaceName ? `Created workspace "${details.workspaceName}"` : "Created the workspace"),
		workspace_updated: (details) => {
			const workspaceName = details?.workspaceName ? `"${details.workspaceName}"` : "the workspace";
			const changes = details?.changes;
			const changeList = changes ? formatChangesToList(changes) : [];

			if (changeList.length > 1) {
				const listItems = changeList.map((change) => `<li>${change}</li>`).join("");
				return `Updated workspace ${workspaceName}<ul>${listItems}</ul>`;
			} else if (changeList.length === 1) {
				return `Updated workspace ${workspaceName}: ${changeList[0]}`;
			} else {
				return `Updated workspace ${workspaceName}`;
			}
		},
		workspace_deleted: (details) => (details?.workspaceName ? `Deleted workspace "${details.workspaceName}"` : "Deleted the workspace"),
		member_invited: (details) => {
			const target = details?.invitedUserName || details?.invitedEmail || "a new member";
			return `Invited ${target}`;
		},
		member_joined: (details) => {
			const inviterId = details?.invitedByUserId;
			return inviterId ? `(Invited by User ID ${inviterId})` : null;
		},
		member_removed: (details) => {
			const target = getTargetUserName(details, "removed");
			return `Removed ${target} from the workspace`;
		},
		member_promoted: (details) => {
			const target = getTargetUserName(details, "promoted");
			const role = details?.newRole || "a new role";
			const prevRole = details?.previousRole ? ` (was ${details.previousRole})` : "";
			return `Promoted ${target} to ${role}${prevRole}`;
		},
		member_demoted: (details) => {
			const target = getTargetUserName(details, "demoted");
			const role = details?.newRole || "their previous role";
			const prevRole = details?.previousRole ? ` (was ${details.previousRole})` : "";
			return `Demoted ${target} to ${role}${prevRole}`;
		},
		task_created: (details) => descriptionActionMap.created(details),
		task_updated: (details) => descriptionActionMap.updated(details), // Reuse the updated logic
		task_deleted: (details) => descriptionActionMap.deleted(details),
		task_assigned: (details) => descriptionActionMap.assigned(details),
		task_unassigned: (details) => descriptionActionMap.unassigned(details),
		default: (details) => (details ? JSON.stringify(details) : null),
	};

	const getLabel = (entry: any): string => {
		if (!entry || !entry.action) return "Unknown action occurred";
		const actorName = getUserName(entry.user);
		const formatter = labelActionMap[entry.action];
		return formatter ? formatter(actorName, entry.details || {}) : `${actorName} performed an unknown action (${entry.action})`;
	};

	const getDescription = (entry: any): string | null => {
		if (!entry || !entry.action) return null;
		const formatter = descriptionActionMap[entry.action] || descriptionActionMap.default;
		return formatter(entry.details || {});
	};

	return { getLabel, getDescription };
};
