<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import type { StatisticsResponse } from "~/types";

definePageMeta({ name: "workspaces-slug", layout: "workspace" });

const {
	data: stats,
	isPending: isStatsLoading,
	isError: isStatsError,
	error: statsError,
	refetch: refetchStats,
} = useQuery({
	queryKey: ["workspace-stats", useRoute().params.slug],
	queryFn: async () => {
		const { success, statistics } = await useApiFetch<StatisticsResponse>(API_ENDPOINTS.workspaces.statistics(useRoute().params.slug));
		if (!statistics || !success) throw new Error("Failed to fetch workspace statistics");
		return statistics;
	},
});

const statOverview = computed(() => [
	{
		title: "Completed",
		value: stats.value?.completedTasks.count ?? 0,
		yesterday: `${stats.value?.completedTasks.completedYesterday ?? 0} yesterday`,
		icon: "hugeicons:checkmark-circle-01",
		color: "text-green-500",
	},
	{
		title: "In progress",
		value: stats.value?.inProgressTasks.count ?? 0,
		yesterday: `${stats.value?.inProgressTasks.movedToDoneYesterday ?? 0} moved to done`,
		icon: "hugeicons:clock-01",
		color: "text-amber-500",
	},
	{ title: "Overdue", value: stats.value?.overdueTasks.count ?? 0, yesterday: `${stats.value?.overdueTasks.newlyOverdueYesterday ?? 0} new`, icon: "hugeicons:alert-circle", color: "text-danger" },
]);
</script>

<template>
	<div class="space-y-8">
		<div class="border-border flex flex-col justify-between gap-5 border-b pb-6 md:flex-row md:items-end">
			<div>
				<p class="editorial-kicker">Workspace overview</p>
				<h1 class="page-heading mt-1">Tasks, in one view.</h1>
				<p class="page-intro mt-2">Review task activity, ownership, and what needs attention next.</p>
			</div>

			<AppTaskCreateOrEdit is-creating />
		</div>

		<div v-if="isStatsLoading" class="divide-border border-border grid divide-y border-y md:grid-cols-3 md:divide-x md:divide-y-0">
			<Skeleton class="h-24 w-full" />
			<Skeleton class="h-24 w-full" />
			<Skeleton class="h-24 w-full" />
		</div>

		<AppEmptyState
			v-else-if="isStatsError"
			heading="Could not load workspace stats"
			:body="String(statsError || 'Try again in a moment.')"
			icon="lucide:alert-circle"
			:action="{ label: 'Retry', onClick: () => refetchStats(), variant: 'secondary' }"
		/>

		<div v-else class="divide-border border-border grid divide-y border-y md:grid-cols-3 md:divide-x md:divide-y-0">
			<div v-for="stat in statOverview" :key="stat.title" class="flex items-end justify-between gap-4 px-1 py-4 md:px-5">
				<div>
					<p class="text-text-tertiary text-xs font-semibold">{{ stat.title }}</p>
					<p class="mt-1 font-mono text-3xl font-semibold tabular-nums">{{ stat.value }}</p>
					<p class="text-text-secondary mt-1 text-xs">{{ stat.yesterday }}</p>
				</div>
				<Icon :name="stat.icon" :size="18" :class="stat.color" />
			</div>
		</div>

		<div class="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:gap-12">
			<section>
				<div class="mb-4 flex items-end justify-between gap-4">
					<div>
						<h2 class="text-xl font-bold tracking-[-0.025em]">Recent tasks</h2>
						<p class="text-text-secondary mt-1 text-sm">The latest task activity in this workspace.</p>
					</div>
					<NuxtLink :to="`/app/workspaces/${useRoute().params.slug}/tasks`" class="text-primary text-sm font-semibold hover:underline">View all tasks</NuxtLink>
				</div>
				<AppTaskRecents />
			</section>
			<AppWorkspaceStat v-if="stats" :stats="stats" />
			<AppEmptyState v-else heading="No activity summary yet" body="Workspace statistics will appear once tasks start moving." icon="lucide:bar-chart-3" />
		</div>
	</div>
</template>
