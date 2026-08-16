import { useQuery } from "@tanstack/vue-query";
import type { TeamPerformanceStat } from "~/types";

export const useTeamStats = () => {
	const route = useRoute();
	const period = ref<"7d" | "30d" | "90d">("7d");
	const statsOpen = ref(true);
	const periodToApiValue = computed(() => (period.value === "30d" ? "month" : period.value === "90d" ? "quarter" : "week"));

	const {
		data,
		isPending: isStatsLoading,
		isError: isStatsError,
		error: statsError,
		refetch: refetchStats,
	} = useQuery({
		queryKey: ["team-members-stat", periodToApiValue],
		queryFn: async () => {
			const { success, message, data } = await useApiFetch<{ success: boolean; message?: string; data: TeamPerformanceStat }>(
				API_ENDPOINTS.workspaces.teamStatistics(route.params.slug, periodToApiValue.value),
				{ method: "GET" }
			);
			if (!success && !data) throw createError({ status: 500, statusMessage: message || "Unable to load team statistics. Try again." });
			return data;
		},
	});

	const metrics = computed(() => {
		const overall = data.value?.overallStats;
		if (!overall) return [];
		return [
			{ key: "total", label: "Total tasks", value: overall.totalTasks, deltaLabel: `Window ${period.value}`, deltaTone: "text-text-tertiary" },
			{ key: "completed", label: "Completed", value: overall.completedTasks, deltaLabel: `${overall.completionRate}% completion`, deltaTone: "text-success" },
			{ key: "rate", label: "Completion rate", value: `${overall.completionRate}%`, deltaLabel: `${overall.onTimeDeliveryRate}% on-time`, deltaTone: "text-info" },
			{ key: "members", label: "Active members", value: data.value?.memberStats?.length ?? 0, deltaLabel: `${overall.teamUtilizationRate}% utilization`, deltaTone: "text-warning" },
		];
	});

	return { isStatsError, isStatsLoading, metrics, period, refetchStats, statsError, statsOpen };
};
