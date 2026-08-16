<script setup lang="ts">
import { formatDate } from "~/utils";
import type { DashboardTask, DashboardTaskFilter } from "../types";

const props = defineProps<{
	activeFilter: DashboardTaskFilter;
	completedCount: number;
	loading: boolean;
	tasks: DashboardTask[];
	isDueToday: (task: DashboardTask) => boolean;
	isOverdue: (task: DashboardTask) => boolean;
}>();

const emit = defineEmits<{
	"update:activeFilter": [value: DashboardTaskFilter];
}>();

const filters: Array<{ label: string; value: DashboardTaskFilter }> = [
	{ label: "Open", value: "all" },
	{ label: "Due today", value: "today" },
	{ label: "Overdue", value: "overdue" },
	{ label: "In progress", value: "in-progress" },
];

const activeFilterModel = computed({
	get: () => props.activeFilter,
	set: (value: DashboardTaskFilter) => emit("update:activeFilter", value),
});

const openTask = (task: DashboardTask) => navigateTo(`/app/workspaces/${task.workspaceSlug}/tasks?taskId=${task.id}`);

const dueLabel = (task: DashboardTask) => {
	if (!task.dueDate) return "No due date";
	if (props.isOverdue(task)) return "Overdue";
	if (props.isDueToday(task)) return "Today";
	return formatDate(task.dueDate, "MMM D");
};
</script>

<template>
	<section class="border-border bg-surface-0 overflow-hidden rounded-xl border shadow-xs">
		<header class="border-border flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<p class="text-text-primary text-sm font-semibold">Your queue</p>
				<p class="text-text-tertiary mt-1 text-xs">The work that needs your attention next.</p>
			</div>
			<SegmentedControl v-model="activeFilterModel" :options="filters" label="Filter your queue" />
		</header>

		<div v-if="loading" class="space-y-2 p-3"><Skeleton v-for="index in 5" :key="index" class="h-14 w-full rounded-lg" /></div>

		<div v-else-if="tasks.length" class="divide-border divide-y">
			<Pressable
				v-for="task in tasks.slice(0, 7)"
				:key="task.id"
				class="hover:bg-surface-1 group grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 text-start"
				@click="openTask(task)"
			>
				<span class="border-border flex h-5 w-5 items-center justify-center rounded-full border" :class="task.status === 'in_progress' ? 'border-primary bg-accent-subtle' : ''">
					<span v-if="task.status === 'in_progress'" class="bg-primary h-1.5 w-1.5 rounded-full" />
				</span>
				<span class="min-w-0">
					<span class="text-text-primary block truncate text-sm font-medium">{{ task.title }}</span>
					<span class="text-text-tertiary mt-1 flex items-center gap-2 text-xs">
						<span class="truncate">{{ task.workspaceTitle }}</span
						><span aria-hidden="true">·</span><span class="tabular-nums">{{ task.commentCount }} {{ task.commentCount === 1 ? "comment" : "comments" }}</span>
					</span>
				</span>
				<span class="flex items-center gap-3">
					<span class="text-xs font-medium" :class="isOverdue(task) ? 'text-danger' : isDueToday(task) ? 'text-warning' : 'text-text-tertiary'">{{ dueLabel(task) }}</span>
					<Icon
						name="lucide:arrow-up-right"
						:size="15"
						class="text-text-tertiary group-hover:blur-0 scale-[0.25] opacity-0 blur-[4px] transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-hover:scale-100 group-hover:opacity-100"
					/>
				</span>
			</Pressable>
		</div>

		<div v-else class="flex min-h-56 flex-col items-center justify-center p-8 text-center">
			<div class="bg-success-subtle text-success flex h-11 w-11 items-center justify-center rounded-full"><Icon name="lucide:check" :size="20" /></div>
			<p class="text-text-primary mt-4 text-sm font-semibold">Nothing needs attention here.</p>
			<p class="text-text-tertiary mt-1 text-xs tabular-nums">{{ completedCount }} completed task{{ completedCount === 1 ? "" : "s" }} in your recent queue.</p>
		</div>
	</section>
</template>
