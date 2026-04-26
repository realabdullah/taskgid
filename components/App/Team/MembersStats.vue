<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import type { TeamPerformanceStat } from "~/types";

const route = useRoute();
const period = ref<"7d" | "30d" | "90d">("7d");
const statsOpen = ref(true);

const periodToApiValue = computed(() => {
	if (period.value === "30d") return "month";
	if (period.value === "90d") return "quarter";
	return "week";
});

const {
	data,
	isPending: isStatsLoading,
	isError: isStatsError,
	error: statsError,
	refetch: refetchStats,
} = useQuery({
	queryKey: ["team-members-stat", periodToApiValue],
	queryFn: async () => {
		const url = API_ENDPOINTS.workspaces.teamStatistics(route.params.slug, periodToApiValue.value);
		const { success, message, data } = await useApiFetch<{ success: boolean; message?: string; data: TeamPerformanceStat }>(url, {
			method: "GET",
		});
		if (!success && !data) throw createError({ status: 500, statusMessage: message || "An error occured getting team members stats" });
		return data;
	},
});

const metrics = computed(() => {
	const overall = data.value?.overallStats;
	if (!overall) return [];

	return [
		{
			key: "total",
			label: "Total tasks",
			value: overall.totalTasks,
			deltaLabel: `Window ${period.value}`,
			deltaTone: "text-text-tertiary",
		},
		{
			key: "completed",
			label: "Completed",
			value: overall.completedTasks,
			deltaLabel: `${overall.completionRate}% completion`,
			deltaTone: "text-success",
		},
		{
			key: "rate",
			label: "Completion rate",
			value: `${overall.completionRate}%`,
			deltaLabel: `${overall.onTimeDeliveryRate}% on-time`,
			deltaTone: "text-info",
		},
		{
			key: "members",
			label: "Active members",
			value: data.value?.memberStats?.length ?? 0,
			deltaLabel: `${overall.teamUtilizationRate}% utilization`,
			deltaTone: "text-warning",
		},
	];
});
</script>

<template>
	<section class="border-border bg-surface-0 space-y-3 rounded-lg border p-4">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div>
				<p class="text-text-primary text-sm font-semibold">Team performance</p>
				<p class="text-text-tertiary text-xs">Track delivery health and capacity trends.</p>
			</div>

			<div class="flex items-center gap-2">
				<div class="border-border bg-surface-1 inline-flex items-center rounded-full border p-1">
					<button
						type="button"
						class="interactive rounded-full px-2.5 py-1 text-xs"
						:class="period === '7d' ? 'bg-accent-subtle text-accent-text' : 'text-text-secondary hover:bg-surface-2'"
						@click="period = '7d'"
					>
						7d
					</button>
					<button
						type="button"
						class="interactive rounded-full px-2.5 py-1 text-xs"
						:class="period === '30d' ? 'bg-accent-subtle text-accent-text' : 'text-text-secondary hover:bg-surface-2'"
						@click="period = '30d'"
					>
						30d
					</button>
					<button
						type="button"
						class="interactive rounded-full px-2.5 py-1 text-xs"
						:class="period === '90d' ? 'bg-accent-subtle text-accent-text' : 'text-text-secondary hover:bg-surface-2'"
						@click="period = '90d'"
					>
						90d
					</button>
				</div>

				<Button variant="ghost" size="sm" class="h-8" @click="statsOpen = !statsOpen">
					{{ statsOpen ? "Hide stats" : "Show stats" }}
				</Button>
			</div>
		</div>

		<div v-if="statsOpen" class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
			<div v-if="isStatsLoading" class="col-span-full grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
				<Skeleton class="h-24 w-full" />
				<Skeleton class="h-24 w-full" />
				<Skeleton class="h-24 w-full" />
				<Skeleton class="h-24 w-full" />
			</div>

			<AppEmptyState
				v-else-if="isStatsError"
				heading="Could not load team stats"
				:body="String(statsError || 'Try again in a moment.')"
				icon="lucide:alert-circle"
				:action="{ label: 'Retry', onClick: () => refetchStats(), variant: 'secondary' }"
			/>

			<template v-else-if="metrics.length">
				<article v-for="metric in metrics" :key="metric.key" class="border-border bg-surface-0 rounded-lg border p-4">
					<p class="text-text-tertiary text-xs">{{ metric.label }}</p>
					<p class="text-text-primary mt-2 text-2xl font-semibold">{{ metric.value }}</p>
					<p class="mt-2 text-xs" :class="metric.deltaTone">{{ metric.deltaLabel }}</p>
				</article>
			</template>

			<AppEmptyState v-else heading="No team stats yet" body="Team performance metrics will appear when activity data is available." icon="lucide:bar-chart-3" />
		</div>
	</section>
</template>
