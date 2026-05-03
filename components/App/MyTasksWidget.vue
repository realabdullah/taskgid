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
		"bg-indigo-500/15 text-indigo-700 border-indigo-200",
		"bg-violet-500/15 text-violet-700 border-violet-200",
		"bg-teal-500/15 text-teal-700 border-teal-200",
		"bg-amber-500/15 text-amber-700 border-amber-200",
		"bg-rose-500/15 text-rose-700 border-rose-200",
		"bg-sky-500/15 text-sky-700 border-sky-200",
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
	<section class="linear-shell rounded-xl p-5">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex items-center gap-3">
				<h2 class="linear-title text-lg font-semibold">My tasks</h2>
				<div class="border-border bg-surface-1 hidden items-center gap-1 rounded-full border p-1 md:flex">
					<button
						v-for="filter in [
							{ value: 'all', label: 'All' },
							{ value: 'due-today', label: 'Due today' },
							{ value: 'overdue', label: 'Overdue' },
							{ value: 'in-progress', label: 'In progress' },
						]"
						:key="filter.value"
						type="button"
						class="interactive rounded-full px-2.5 py-1 text-xs font-medium"
						:class="activeFilter === filter.value ? 'bg-accent-soft text-accent-strong' : 'text-text-secondary hover:bg-surface-2'"
						@click="activeFilter = filter.value as TaskFilter"
					>
						{{ filter.label }}
					</button>
				</div>
			</div>

			<button type="button" class="text-primary text-sm font-medium hover:underline" @click="goToAllTasks">View all</button>
		</div>

		<div v-if="isFetching" class="mt-4 space-y-2">
			<Skeleton class="h-11 w-full" />
			<Skeleton class="h-11 w-full" />
			<Skeleton class="h-11 w-full" />
		</div>

		<AppEmptyState
			v-else-if="isTasksError"
			heading="Could not load your tasks"
			:body="String(tasksError || 'Please try again in a moment.')"
			icon="lucide:alert-circle"
			:action="{ label: 'Retry', onClick: () => refetchTasks(), variant: 'secondary' }"
		/>

		<div v-else-if="visibleTasks.length" class="mt-4 overflow-x-auto">
			<div
				v-for="task in visibleTasks"
				:key="task.id"
				class="interactive hover:border-border hover:bg-surface-1 grid min-h-11 cursor-pointer grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-3 rounded-md border border-transparent px-3 py-2"
				@click="openTask(task)"
			>
				<div class="flex min-w-0 items-center gap-2">
					<span class="rounded-full border px-2 py-0.5 text-xs font-medium" :class="workspaceAccent(task.workspaceSlug)">
						{{ task.workspaceTitle }}
					</span>
					<p class="text-text-primary truncate text-sm">{{ task.title }}</p>
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
