import { useQuery } from "@tanstack/vue-query";
import type { StatisticsResponse } from "~/types";

export const useWorkspaceOverview = () => {
	const route = useRoute();
	const workspaceSlug = computed(() => String(route.params.slug ?? ""));
	const {
		data: stats,
		isPending: isStatsLoading,
		isError: isStatsError,
		error: statsError,
		refetch: refetchStats,
	} = useQuery({
		queryKey: ["workspace-stats", workspaceSlug],
		queryFn: async () => {
			const { success, statistics } = await useApiFetch<StatisticsResponse>(API_ENDPOINTS.workspaces.statistics(workspaceSlug.value));
			if (!statistics || !success) throw new Error("Unable to load workspace statistics. Try again.");
			return statistics;
		},
	});
	const statOverview = computed(() => [
		{
			title: "Completed",
			value: stats.value?.completedTasks.count ?? 0,
			yesterday: `${stats.value?.completedTasks.completedYesterday ?? 0} yesterday`,
			icon: "hugeicons:checkmark-circle-01",
			color: "text-success",
		},
		{
			title: "In progress",
			value: stats.value?.inProgressTasks.count ?? 0,
			yesterday: `${stats.value?.inProgressTasks.movedToDoneYesterday ?? 0} moved to done`,
			icon: "hugeicons:clock-01",
			color: "text-warning",
		},
		{
			title: "Overdue",
			value: stats.value?.overdueTasks.count ?? 0,
			yesterday: `${stats.value?.overdueTasks.newlyOverdueYesterday ?? 0} new`,
			icon: "hugeicons:alert-circle",
			color: "text-danger",
		},
	]);
	const createTask = () => navigateTo(`/app/workspaces/${workspaceSlug.value}/tasks?create=task`);

	return { createTask, isStatsError, isStatsLoading, refetchStats, statOverview, stats, statsError, workspaceSlug };
};
