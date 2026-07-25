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
	<section class="border-border border-y py-5">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div>
				<p class="text-lg font-bold tracking-[-0.025em]">The team, at a glance.</p>
				<p class="text-text-secondary text-sm">Activity recorded in the selected period.</p>
			</div>

			<div class="flex items-center gap-2">
				<div class="border-border inline-flex items-center border p-0.5">
					<button
						type="button"
						class="interactive rounded-sm px-2.5 py-1 text-xs"
						:class="period === '7d' ? 'bg-primary text-primary-foreground' : 'text-text-tertiary hover:bg-surface-2'"
						@click="period = '7d'"
					>
						7d
					</button>
					<button
						type="button"
						class="interactive rounded-sm px-2.5 py-1 text-xs"
						:class="period === '30d' ? 'bg-primary text-primary-foreground' : 'text-text-tertiary hover:bg-surface-2'"
						@click="period = '30d'"
					>
						30d
					</button>
					<button
						type="button"
						class="interactive rounded-sm px-2.5 py-1 text-xs"
						:class="period === '90d' ? 'bg-primary text-primary-foreground' : 'text-text-tertiary hover:bg-surface-2'"
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

		<div v-if="statsOpen" class="divide-border mt-5 grid divide-y md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
			<div v-if="isStatsLoading" class="divide-border col-span-full grid grid-cols-1 divide-y md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
				<Skeleton class="h-24 w-full" />
				<Skeleton class="h-24 w-full" />
				<Skeleton class="h-24 w-full" />
				<Skeleton class="h-24 w-full" />
			</div>

			<AppEmptyState
				v-else-if="isStatsError"
				heading="Could not load team stats"
				:body="getServerError(statsError, 'Try again in a moment.')"
				icon="lucide:alert-circle"
				:action="{ label: 'Retry', onClick: () => refetchStats(), variant: 'secondary' }"
			/>

			<template v-else-if="metrics.length">
				<article v-for="metric in metrics" :key="metric.key" class="px-1 py-3 md:px-5">
					<p class="text-text-tertiary text-xs font-semibold">{{ metric.label }}</p>
					<p class="mt-2 font-mono text-3xl font-semibold tracking-[-0.03em] tabular-nums">{{ metric.value }}</p>
					<p class="mt-2 text-xs" :class="metric.deltaTone">{{ metric.deltaLabel }}</p>
				</article>
			</template>

			<AppEmptyState v-else heading="No team stats yet" body="Team performance metrics will appear when activity data is available." icon="lucide:bar-chart-3" />
		</div>
	</section>
</template>
