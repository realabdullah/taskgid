<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import type { ActivityDetails, StatisticsResponse } from "~/types";

const props = defineProps<{ stats?: StatisticsResponse["statistics"] }>();

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
const {
	data: activities,
	isPending: isActivitiesLoading,
	isError: isActivitiesError,
	error: activitiesError,
	refetch: refetchActivities,
} = useQuery({
	queryKey: ["member-activity", props.stats?.memberActivity],
	queryFn: async () => {
		const { success, data, message } = await useApiFetch<{ success: boolean; data: ActivityDetails[]; message?: string }>(API_ENDPOINTS.workspaces.activities(useRoute().params.slug));
		if (!data || !success) throw new Error(message || "Failed to fetch workspace statistics");
		return data;
	},
});
</script>

<template>
	<aside class="border-border border-l pl-6 lg:pl-8">
		<div>
			<h2 class="text-xl font-bold tracking-[-0.025em]">Workspace summary</h2>
			<p class="text-text-secondary mt-1 text-sm">A compact view of task status and ownership.</p>
		</div>
		<section v-for="item in tasksStats" :key="item.title" class="border-border mt-6 border-t pt-4">
			<h3 class="text-text-primary text-sm font-bold">{{ item.title }}</h3>
			<div class="mt-3 space-y-3">
				<div v-for="summary in item.summary" :key="summary.key">
					<div class="flex items-center justify-between gap-3 text-xs">
						<span class="text-text-secondary">{{ summary.label }}</span
						><span class="text-text-primary font-mono font-semibold tabular-nums">{{ summary.count }} · {{ summary.percentage }}%</span>
					</div>
					<div class="bg-surface-2 mt-1.5 h-1.5 overflow-hidden"><div class="h-full" :class="[summary.color]" :style="{ width: `${summary.percentage}%` }" /></div>
				</div>
			</div>
		</section>

		<section class="border-border mt-6 border-t pt-4">
			<h3 class="text-text-primary text-sm font-bold">Latest activity</h3>
			<div v-if="isActivitiesLoading" class="mt-3 space-y-2"><Skeleton class="h-10 w-full" /><Skeleton class="h-10 w-full" /></div>
			<AppEmptyState
				v-else-if="isActivitiesError"
				class="mt-3"
				heading="Activity is unavailable"
				:body="String(activitiesError || 'Please try again.')"
				icon="lucide:alert-circle"
				:action="{ label: 'Retry', onClick: () => refetchActivities(), variant: 'secondary' }"
			/>
			<div v-else-if="activities?.length" class="divide-border mt-3 divide-y">
				<div v-for="activity in activities.slice(0, 4)" :key="activity.id" class="py-3 first:pt-0">
					<p class="text-text-primary text-xs font-semibold">{{ getLabel(activity) }}</p>
					<p class="text-text-secondary mt-1 text-xs leading-5" v-html="getDescription(activity)"></p>
					<p class="text-text-tertiary mt-1 font-mono text-[10px]">{{ getTimeAgo(new Date(activity.createdAt)) }}</p>
				</div>
			</div>
			<p v-else class="text-text-tertiary mt-3 text-xs">No activity has been recorded yet.</p>
		</section>
	</aside>
</template>
