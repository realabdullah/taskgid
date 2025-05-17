<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import type { ActivityDetails, StatisticsResponse } from "~/types";

const props = defineProps<{ stats?: StatisticsResponse["statistics"] }>();

const tabs = [
	{ value: "tasks", label: "Tasks" },
	{ value: "activity", label: "Activity" },
	{ value: "members", label: "Members" },
];

const activeTab = ref("tasks");

const tasksStats = computed(() => {
	const breakdown = props.stats?.statusBreakdown || ({} as StatisticsResponse["statistics"]["statusBreakdown"]);
	const statusColorMap: { [key: string]: string } = { todo: "bg-slate-500", in_progress: "bg-amber-500", done: "bg-green-500" };

	const statusSummary = Object.entries(breakdown).map(([key, val]) => ({
		key,
		label: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
		count: val.count || 0,
		percentage: val.percentage || 0,
		color: statusColorMap[key] || "#a1a1aa",
	}));

	const priorityBreakdown = props.stats?.priorityBreakdown || ({} as StatisticsResponse["statistics"]["priorityBreakdown"]);
	const priorityColorMap: { [key: string]: string } = { high: "bg-rose-500", medium: "bg-amber-500", low: "bg-green-500" };

	const prioritySummary = Object.entries(priorityBreakdown).map(([key, val]) => ({
		key,
		label: key.charAt(0).toUpperCase() + key.slice(1),
		count: val.total?.count || 0,
		percentage: val.total?.percentage || 0,
		color: priorityColorMap[key] || "#a1a1aa",
	}));

	return [
		{ title: "Task Status", summary: statusSummary },
		{ title: "Task Priority", summary: prioritySummary },
	];
});

const { getLabel, getDescription } = useActivityLabel();
const { data: activities } = useQuery({
	queryKey: ["member-activity", props.stats?.memberActivity],
	queryFn: async () => {
		const { success, data, message } = await useApiFetch<{ success: boolean; data: ActivityDetails[]; message?: string }>(`/workspaces/${useRoute().params.slug}/activities`);
		if (!data || !success) throw new Error(message || "Failed to fetch workspace statistics");
		return data;
	},
});
</script>

<template>
	<Card>
		<CardHeader>
			<CardTitle>Workspace Statistics</CardTitle>
			<CardDescription>Task completion and activity metrics for the current workspace</CardDescription>
		</CardHeader>

		<CardContent>
			<Tabs v-model="activeTab">
				<TabsList class="grid w-full grid-cols-3">
					<TabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value">{{ tab.label }}</TabsTrigger>
				</TabsList>

				<TabsContent :value="activeTab" class="space-y-4">
					<div v-if="activeTab === 'tasks'" class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
						<div v-for="item in tasksStats" :key="item.title" class="space-y-2">
							<div class="text-sm font-medium">{{ item.title }}</div>
							<div v-for="summary in item.summary" :key="summary.key" class="space-y-2">
								<div class="flex items-center justify-between">
									<div class="text-sm">{{ summary.label }}</div>
									<div class="text-sm font-medium">{{ summary.count }} ({{ summary.percentage }}%)</div>
								</div>
								<div class="bg-muted h-2 w-full overflow-hidden rounded-full">
									<div class="h-full" :class="[summary.color]" :style="{ width: `${summary.percentage}%` }" />
								</div>
							</div>
						</div>
					</div>

					<div v-else-if="activeTab === 'activity'" class="mt-4 space-y-4">
						<div class="text-sm font-medium">Recent Activity</div>
						<div class="space-y-4">
							<div v-for="activity in activities" :key="activity.id" class="flex items-start gap-4">
								<div class="bg-primary mt-2 h-2 w-2 rounded-full" />
								<div class="space-y-1">
									<p class="text-sm font-medium">{{ getLabel(activity) }}</p>
									<p class="text-muted-foreground text-sm" v-html="getDescription(activity)"></p>
									<p class="text-muted-foreground text-xs">{{ getTimeAgo(new Date(activity.createdAt)) }}</p>
								</div>
							</div>
						</div>
					</div>

					<div v-else-if="activeTab === 'members'" class="mt-4 space-y-4">
						<div class="text-sm font-medium">Member Activity</div>
						<div v-if="stats?.memberActivity" class="space-y-4">
							<div v-for="activity in stats?.memberActivity" :key="activity.user.username" class="space-y-2">
								<div class="flex items-center justify-between">
									<div class="text-sm">{{ activity.user.firstName }} {{ activity.user.lastName }}</div>
									<div class="text-sm font-medium">{{ activity.assigned + activity.completed }} tasks</div>
								</div>
								<div class="bg-muted h-2 w-full overflow-hidden rounded-full">
									<div class="bg-primary h-full" :style="{ width: `${activity.percentage}%` }" />
								</div>
							</div>
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</CardContent>
	</Card>
</template>
