<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";

import type { Task } from "~/types";
import { useApiFetch } from "../../composables/useApiFetch";
import { useStore } from "../../stores";
import { useWorkspacesStore } from "../../stores/workspaces";
import { formatDate } from "../../utils";

type DashboardTask = Task & {
	workspaceTitle: string;
	workspaceSlug: string;
};

type TaskFilter = "all" | "due-today" | "overdue" | "in-progress";

const { user } = storeToRefs(useStore());
const { workspaces } = storeToRefs(useWorkspacesStore());

const activeFilter = ref<TaskFilter>("all");
const showAll = ref(false);

const isAssignedToCurrentUser = (task: Task) => {
	if (!user.value) {
		return false;
	}
	return task.assignees.some((assignee) => assignee.id === user.value?.id || assignee.username === user.value?.username);
};

const sortByDueDateAsc = (left: DashboardTask, right: DashboardTask) => {
	if (!left.dueDate && !right.dueDate) {
		return 0;
	}
	if (!left.dueDate) {
		return 1;
	}
	if (!right.dueDate) {
		return -1;
	}
	return new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime();
};

const {
	data: tasks,
	isFetching,
	isError: isTasksError,
	error: tasksError,
	refetch: refetchTasks,
} = useQuery({
	queryKey: ["dashboard-my-tasks", workspaces],
	queryFn: async () => {
		const allWorkspaces = workspaces.value ?? [];
		if (!allWorkspaces.length) {
			return [] as DashboardTask[];
		}

		const tasksByWorkspace = await Promise.all(
			allWorkspaces.map(async (workspace) => {
				const response = await useApiFetch<{ success: boolean; data: Task[] }>(API_ENDPOINTS.workspaces.tasks(workspace.slug));
				if (!response?.success || !response.data) {
					throw new Error(`Failed to load tasks for ${workspace.title}`);
				}
				return response.data.map((task) => ({
					...task,
					workspaceTitle: workspace.title,
					workspaceSlug: workspace.slug,
				}));
			})
		);

		return tasksByWorkspace
			.flat()
			.filter((task) => isAssignedToCurrentUser(task))
			.sort(sortByDueDateAsc);
	},
	enabled: computed(() => Boolean(user.value?.id) && (workspaces.value?.length ?? 0) > 0),
});

const isDueToday = (date: string | null) => {
	if (!date) {
		return false;
	}
	const due = new Date(date);
	const now = new Date();
	return due.toDateString() === now.toDateString();
};

const isOverdue = (date: string | null) => {
	if (!date) {
		return false;
	}
	const due = new Date(date);
	const now = new Date();
	return due.getTime() < now.getTime() && !isDueToday(date);
};

const filteredTasks = computed(() => {
	const source = tasks.value ?? [];

	if (activeFilter.value === "all") {
		return source;
	}

	if (activeFilter.value === "due-today") {
		return source.filter((task) => isDueToday(task.dueDate));
	}

	if (activeFilter.value === "overdue") {
		return source.filter((task) => isOverdue(task.dueDate));
	}

	return source.filter((task) => task.status === "in_progress");
});

const visibleTasks = computed(() => {
	if (showAll.value) {
		return filteredTasks.value;
	}
	return filteredTasks.value.slice(0, 8);
});

const hasMore = computed(() => filteredTasks.value.length > 8);
const openTasks = computed(() => (tasks.value ?? []).filter((task) => task.status !== "done" && task.status !== "cancelled"));
const completedTasks = computed(() => (tasks.value ?? []).filter((task) => task.status === "done").length);
const focusTask = computed(() => {
	return (
		openTasks.value.find((task) => isOverdue(task.dueDate)) ??
		openTasks.value.find((task) => isDueToday(task.dueDate)) ??
		openTasks.value.find((task) => task.status === "in_progress") ??
		openTasks.value[0]
	);
});
const focusLabel = computed(() => {
	if (!focusTask.value) return "You’re clear for now";
	if (isOverdue(focusTask.value.dueDate)) return "Needs attention";
	if (isDueToday(focusTask.value.dueDate)) return "Due today";
	if (focusTask.value.status === "in_progress") return "In progress";
	return "Up next";
});

const dueDateClass = (date: string | null) => {
	if (!date) {
		return "text-text-tertiary";
	}
	if (isOverdue(date)) {
		return "text-danger font-medium";
	}
	if (isDueToday(date)) {
		return "text-warning font-medium";
	}
	return "text-text-secondary";
};

const dueDateText = (date: string | null) => {
	if (!date) {
		return "No due date";
	}
	if (isDueToday(date)) {
		return "Due today";
	}
	if (isOverdue(date)) {
		return "Overdue";
	}
	return formatDate(date, "MMM D");
};

const workspaceAccent = (slug: string) => {
	const palette = [
		"bg-accent-subtle text-accent-text border-accent/30",
		"bg-signal-subtle text-danger border-danger/25",
		"bg-success-subtle text-success border-success/25",
		"bg-warning-subtle text-warning border-warning/25",
	];
	const hash = Array.from(slug).reduce((acc, char) => acc + char.charCodeAt(0), 0);
	return palette[hash % palette.length];
};

const goToAllTasks = async () => {
	const firstWorkspace = workspaces.value?.[0];
	if (!firstWorkspace) {
		return;
	}
	await navigateTo(`/app/workspaces/${firstWorkspace.slug}/tasks`);
};

const openTask = async (task: DashboardTask) => {
	await navigateTo(`/app/workspaces/${task.workspaceSlug}/tasks/${task.id}`);
};
</script>

<template>
	<section class="border-border border-b pb-8">
		<div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
			<div>
				<p class="editorial-kicker">Your day</p>
				<h2 class="linear-title mt-1 text-3xl">Focus</h2>
				<p class="text-text-secondary mt-2 text-sm">One clear place to decide what deserves your attention next.</p>
			</div>
			<div class="flex items-center gap-4">
				<div class="border-border bg-surface-0 hidden items-center gap-1 rounded-lg border p-1 md:flex">
					<button
						v-for="filter in [
							{ value: 'all', label: 'All' },
							{ value: 'due-today', label: 'Due today' },
							{ value: 'overdue', label: 'Overdue' },
							{ value: 'in-progress', label: 'In progress' },
						]"
						:key="filter.value"
						type="button"
						class="interactive rounded-md px-3 py-1.5 text-xs font-semibold"
						:class="activeFilter === filter.value ? 'bg-primary text-primary-foreground shadow-sm' : 'text-text-secondary hover:bg-surface-2'"
						@click="activeFilter = filter.value as TaskFilter"
					>
						{{ filter.label }}
					</button>
				</div>
				<button type="button" class="text-primary shrink-0 text-sm font-semibold hover:underline" @click="goToAllTasks">View all tasks</button>
			</div>
		</div>

		<button
			v-if="focusTask && !isFetching"
			type="button"
			class="interactive focus-ring border-border bg-surface-0 hover:border-accent/40 hover:bg-accent-subtle/35 mt-5 grid w-full gap-4 rounded-xl border p-4 text-left shadow-xs md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center"
			@click="openTask(focusTask)"
		>
			<div class="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full">
				<Icon name="lucide:crosshair" :size="18" />
			</div>
			<div class="min-w-0">
				<p class="text-primary text-xs font-bold">{{ focusLabel }}</p>
				<p class="text-text-primary mt-1 truncate text-base font-bold tracking-[-0.02em]">{{ focusTask.title }}</p>
				<p class="text-text-secondary mt-1 text-sm">{{ focusTask.workspaceTitle }} · {{ dueDateText(focusTask.dueDate) }}</p>
			</div>
			<div class="text-text-secondary flex items-center gap-3 text-sm font-semibold">
				<span>{{ openTasks.length }} open</span>
				<Icon name="lucide:arrow-up-right" :size="18" />
			</div>
		</button>

		<div v-else-if="!isFetching" class="border-border bg-success-subtle/45 mt-7 flex items-center gap-3 rounded-xl border p-5">
			<div class="bg-success text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full"><Icon name="lucide:check" :size="18" /></div>
			<div>
				<p class="text-text-primary font-bold">Your queue is clear.</p>
				<p class="text-text-secondary mt-0.5 text-sm">{{ completedTasks }} task{{ completedTasks === 1 ? "" : "s" }} completed. Enjoy the breathing room.</p>
			</div>
		</div>

		<div v-if="isFetching" class="mt-5 space-y-3">
			<Skeleton class="h-24 w-full rounded-xl" />
			<Skeleton class="h-14 w-full rounded-xl" />
			<Skeleton class="h-14 w-full rounded-xl" />
		</div>

		<AppEmptyState
			v-else-if="isTasksError"
			heading="Could not load your tasks"
			:body="String(tasksError || 'Please try again in a moment.')"
			icon="lucide:alert-circle"
			:action="{ label: 'Retry', onClick: () => refetchTasks(), variant: 'secondary' }"
		/>

		<div v-else-if="visibleTasks.length" class="mt-6 overflow-x-auto">
			<div class="mb-3 flex items-center justify-between">
				<p class="text-text-primary text-sm font-bold">Up next</p>
				<p class="text-text-tertiary text-xs">{{ filteredTasks.length }} task{{ filteredTasks.length === 1 ? "" : "s" }}</p>
			</div>
			<div class="text-text-tertiary mb-2 hidden grid-cols-[minmax(0,1fr)_auto_auto_auto] gap-3 px-3 text-[11px] font-semibold md:grid">
				<span>Task</span><span>Status</span><span>Due</span><span>Priority</span>
			</div>
			<div
				v-for="task in visibleTasks"
				:key="task.id"
				class="interactive focus-ring border-border hover:bg-surface-0 grid min-h-14 cursor-pointer grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-3 border-t px-3 py-2 first:border-t-0"
				@click="openTask(task)"
			>
				<div class="flex min-w-0 items-center gap-2">
					<span class="rounded-md border px-1.5 py-0.5 text-[10px] font-bold" :class="workspaceAccent(task.workspaceSlug)">
						{{ task.workspaceTitle }}
					</span>
					<p class="text-text-primary truncate text-sm font-semibold">{{ task.title }}</p>
				</div>
				<BadgeStatus :status="task.status" />
				<p class="text-xs" :class="dueDateClass(task.dueDate)">{{ dueDateText(task.dueDate) }}</p>
				<Icon
					name="lucide:triangle-alert"
					class="h-3 w-3 fill-current"
					:class="{
						'text-priority-high': task.priority === 'high',
						'text-priority-medium': task.priority === 'medium',
						'text-priority-low': task.priority === 'low',
					}"
				/>
			</div>

			<div v-if="hasMore" class="mt-3 flex justify-center">
				<Button variant="ghost" size="sm" class="h-8" @click="showAll = !showAll">
					{{ showAll ? "Show less" : "Show more" }}
				</Button>
			</div>
		</div>

		<AppEmptyState v-else heading="You have no assigned tasks. Nice." body="When tasks are assigned to you, they will appear here with due date and priority context." icon="lucide:check-check" />
	</section>
</template>
