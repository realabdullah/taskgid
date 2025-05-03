<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import type { Pagination, StatisticsResponse, Task } from "~/types";
import { getWorkspaceTeams } from "~/utils/apis/workspace";

definePageMeta({ name: "workspaces-slug", layout: "workspace" });

const { data: stats } = useQuery({
	queryKey: ["workspace-stats", useRoute().params.slug],
	queryFn: async () => {
		const { success, statistics } = await useApiFetch<StatisticsResponse>(`/workspaces/${useRoute().params.slug}/statistics`);
		if (!statistics || !success) throw new Error("Failed to fetch workspace statistics");
		return statistics;
	},
});

const { data: recentTasks } = useQuery({
	queryKey: ["workspace-recent-tasks", useRoute().params.slug],
	queryFn: async () => {
		const { success, data: tasks } = await useApiFetch<{ success: boolean; data: Task[]; pagination: Pagination }>(`/workspaces/${useRoute().params.slug}/tasks`);
		if (!tasks || !success) throw new Error("Failed to fetch workspace tasks");
		return tasks;
	},
});

await getWorkspaceTeams(useRoute().params.slug as string);

const activeTab = ref("tasks");
const tabs = [
	{ value: "tasks", label: "Recent Tasks" },
	{ value: "stats", label: "Workspace Stats" },
	{ value: "team", label: "Team Members" },
];
const statOverview = computed(() => [
	{
		title: "Tasks Completed",
		value: stats.value?.completedTasks.count,
		yesterday: `+${stats.value?.completedTasks.completedYesterday}`,
		icon: "hugeicons:checkmark-circle-01",
		color: "text-green-500",
	},
	{ title: "In Progress", value: stats.value?.inProgressTasks.count, yesterday: `-${stats.value?.inProgressTasks.movedToDoneYesterday}`, icon: "hugeicons:clock-01", color: "text-amber-500" },
	{ title: "Overdue", value: stats.value?.overdueTasks.count, yesterday: `+${stats.value?.overdueTasks.newlyOverdueYesterday}`, icon: "hugeicons:alert-circle", color: "text-rose-500" },
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

		<div class="grid gap-6 md:grid-cols-3">
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
				<div v-if="activeTab === 'tasks'" className="space-y-4">
					<AppTaskCard v-for="task in recentTasks" :key="task.id" :task="task" />
				</div>
			</TabsContent>
		</Tabs>
	</div>
</template>
