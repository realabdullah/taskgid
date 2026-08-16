import type { Task } from "~/types";

export type DashboardTask = Task & {
	workspaceSlug: string;
	workspaceTitle: string;
};

export type DashboardTaskFilter = "all" | "today" | "overdue" | "in-progress";
