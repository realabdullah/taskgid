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

const activeTab = ref("tasks");
const tabs = [
	{ value: "tasks", label: "Recent Tasks" },
	{ value: "stats", label: "Workspace Stats" },
];
const statOverview = computed(() => [
	{
		title: "Tasks Completed",
		value: stats.value?.completedTasks.count ?? 0,
		yesterday: `+${stats.value?.completedTasks.completedYesterday ?? 0}`,
		icon: "hugeicons:checkmark-circle-01",
		color: "text-green-500",
	},
	{
		title: "In Progress",
		value: stats.value?.inProgressTasks.count ?? 0,
		yesterday: `-${stats.value?.inProgressTasks.movedToDoneYesterday ?? 0}`,
		icon: "hugeicons:clock-01",
		color: "text-amber-500",
	},
	{ title: "Overdue", value: stats.value?.overdueTasks.count ?? 0, yesterday: `+${stats.value?.overdueTasks.newlyOverdueYesterday ?? 0}`, icon: "hugeicons:alert-circle", color: "text-rose-500" },
]);
</script>

<template>
	<div class="space-y-6">
		<div class="flex flex-col justify-between gap-4 md:flex-row">
			<div>
				<h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
				<p class="text-muted-foreground">Overview of your tasks and workspace activity</p>
			</div>

			<AppTaskCreateOrEdit is-creating />
		</div>

		<div v-if="isStatsLoading" class="grid gap-6 md:grid-cols-3">
			<Skeleton class="h-28 w-full" />
			<Skeleton class="h-28 w-full" />
			<Skeleton class="h-28 w-full" />
		</div>

		<AppEmptyState
			v-else-if="isStatsError"
			heading="Could not load workspace stats"
			:body="String(statsError || 'Try again in a moment.')"
			icon="lucide:alert-circle"
			:action="{ label: 'Retry', onClick: () => refetchStats(), variant: 'secondary' }"
		/>

		<div v-else class="grid gap-6 md:grid-cols-3">
			<Card v-for="stat in statOverview" :key="stat.title">
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium">{{ stat.title }}</CardTitle>
					<Icon :name="stat.icon" :size="16" :class="stat.color" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">{{ stat.value }}</div>
					<p class="text-muted-foreground text-xs">{{ stat.yesterday }} from yesterday</p>
				</CardContent>
			</Card>
		</div>

		<Tabs v-model="activeTab">
			<TabsList>
				<TabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value">{{ tab.label }}</TabsTrigger>
			</TabsList>

			<TabsContent :value="activeTab" class="space-y-4">
				<AppTaskRecents v-if="activeTab === 'tasks'" />
				<AppWorkspaceStat v-else-if="activeTab === 'stats' && stats" :stats="stats" />
				<AppEmptyState v-else-if="activeTab === 'stats'" heading="No stats available" body="Workspace statistics will appear once task activity is available." icon="lucide:bar-chart-3" />
			</TabsContent>
		</Tabs>
	</div>
</template>
