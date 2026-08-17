import { useQuery } from "@tanstack/vue-query";
import { storeToRefs } from "pinia";

import { useStore } from "~/stores";
import { useWorkspacesStore } from "~/features/workspaces/stores";
import type { PaginatedResponse, Task } from "~/types";
import { API_ENDPOINTS } from "~/utils/endpoints";
import type { DashboardTask, DashboardTaskFilter } from "../types";

const startOfToday = () => {
	const now = new Date();
	return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

export const useDashboardOverview = () => {
	const { user } = storeToRefs(useStore());
	const { workspaces } = storeToRefs(useWorkspacesStore());
	const activeFilter = ref<DashboardTaskFilter>("all");

	const { data, isFetching, isError, error, refetch } = useQuery({
		queryKey: ["dashboard-overview", workspaces, user],
		queryFn: async () => {
			const sources = await Promise.all(
				(workspaces.value ?? []).map(async (workspace) => {
					// `assignee=me` is applied by the server, so this no longer pulls a
					// whole workspace down to keep the fraction assigned to one person.
					const response = await useApiFetch<PaginatedResponse<Task>>(API_ENDPOINTS.workspaces.taskSearch(workspace.slug), {
						query: { assignee: "me", sortBy: "dueDate", sortOrder: "ASC", page: 1, limit: 100 },
					});
					if (!response?.success) throw new Error(`Unable to load tasks from ${workspace.title}.`);
					return response.data.map<DashboardTask>((task) => ({ ...task, workspaceSlug: workspace.slug, workspaceTitle: workspace.title }));
				})
			);

			return sources.flat().sort((left, right) => {
				if (!left.dueDate) return 1;
				if (!right.dueDate) return -1;
				return new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime();
			});
		},
		enabled: computed(() => Boolean(user.value?.id && workspaces.value?.length)),
	});

	const tasks = computed(() => data.value ?? []);
	const today = computed(startOfToday);
	const tomorrow = computed(() => new Date(today.value.getFullYear(), today.value.getMonth(), today.value.getDate() + 1));
	const isDueToday = (task: DashboardTask) => Boolean(task.dueDate && new Date(task.dueDate) >= today.value && new Date(task.dueDate) < tomorrow.value);
	const isOverdue = (task: DashboardTask) => Boolean(task.dueDate && new Date(task.dueDate) < today.value && task.status !== "done");

	const openTasks = computed(() => tasks.value.filter((task) => task.status !== "done"));
	const completedTasks = computed(() => tasks.value.filter((task) => task.status === "done"));
	const dueTodayTasks = computed(() => openTasks.value.filter(isDueToday));
	const overdueTasks = computed(() => openTasks.value.filter(isOverdue));
	const inProgressTasks = computed(() => openTasks.value.filter((task) => task.status === "in_progress"));

	const filteredTasks = computed(() => {
		if (activeFilter.value === "today") return dueTodayTasks.value;
		if (activeFilter.value === "overdue") return overdueTasks.value;
		if (activeFilter.value === "in-progress") return inProgressTasks.value;
		return openTasks.value;
	});

	const focusTask = computed(() => overdueTasks.value[0] ?? dueTodayTasks.value[0] ?? inProgressTasks.value[0] ?? openTasks.value[0]);

	return {
		activeFilter,
		completedTasks,
		dueTodayTasks,
		error,
		filteredTasks,
		focusTask,
		inProgressTasks,
		isDueToday,
		isError,
		isFetching,
		isOverdue,
		openTasks,
		overdueTasks,
		refetch,
	};
};
