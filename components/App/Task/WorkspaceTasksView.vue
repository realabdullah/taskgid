<script lang="ts" setup>
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { refDebounced } from "@vueuse/core";

import { useApiFetch } from "~/composables/useApiFetch";
import { useWorkspaceStore } from "~/stores/workspace";
import type { Task, TaskFilter } from "~/types";
import { formatDate } from "~/utils";

type ViewMode = "list" | "board";
type GroupBy = "none" | "status" | "priority" | "assignee";
type DueDateFilter = "all" | "today" | "overdue" | "this-week" | "no-due-date";

const route = useRoute();
const queryClient = useQueryClient();
const workspaceSlug = computed(() => {
	const slug = route.params.slug;
	return typeof slug === "string" ? slug : "";
});
const hasWorkspaceContext = computed(() => Boolean(workspaceSlug.value));
const triggerCreateWorkspace = () => {
	if (!import.meta.client) {
		return;
	}
	globalThis.window.dispatchEvent(new globalThis.CustomEvent("taskgid:add-workspace-intent"));
};
const activeTaskId = computed(() => {
	const taskId = route.query.taskId;
	return typeof taskId === "string" && taskId.length > 0 ? taskId : null;
});
const isTaskDrawerOpen = computed(() => Boolean(activeTaskId.value));

const isTaskModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isBulkActionMenuOpen = ref(false);
const viewMode = ref<ViewMode>("list");
const groupBy = ref<GroupBy>("none");

const selectedTask = ref<Task>();
const selectedTaskIds = ref<string[]>([]);
const focusedTaskIndex = ref(0);

const editingTaskId = ref<string | null>(null);
const editingTitle = ref("");

const searchInput = ref("");
const debouncedSearch = refDebounced(searchInput, 240, { maxWait: 600 });

const filter = reactive<TaskFilter>({
	search: "",
	status: [],
	priority: [],
	assignee: [],
});
const dueDateFilter = ref<DueDateFilter>("all");

const { teams } = storeToRefs(useWorkspaceStore());

watch(debouncedSearch, (value) => {
	filter.search = value;
});

const clearSearch = () => {
	searchInput.value = "";
	filter.search = "";
};

const isFilterActive = computed(() => {
	return Boolean(filter.search) || filter.status.length > 0 || filter.priority.length > 0 || filter.assignee.length > 0 || dueDateFilter.value !== "all";
});

const emptyStateCopy = computed(() => {
	if (isFilterActive.value) {
		return {
			heading: "No tasks match your filters.",
			body: "Try changing filters or clear them to see more tasks.",
			actionLabel: "Clear filters",
		};
	} else {
		return {
			heading: "No tasks yet",
			body: "Create your first one to start moving work forward.",
			actionLabel: "New task",
		};
	}
});

const {
	data: tasks,
	isFetching,
	isError: isTasksError,
	error: tasksError,
	refetch: refetchTasks,
} = useQuery({
	queryKey: computed(() => ["workspace-tasks", workspaceSlug.value, { ...filter }]),
	queryFn: async () => {
		const { success, data: tasks } = await useApiFetch<{ success: boolean; data: Task[] }>(API_ENDPOINTS.workspaces.tasks(workspaceSlug.value), {
			query: filter,
		});
		if (!tasks || !success) throw new Error("Failed to fetch workspace tasks");
		return tasks;
	},
	enabled: computed(() => hasWorkspaceContext.value),
});

const taskRows = computed(() => tasks.value ?? []);

const STATUS_ORDER: Array<Task["status"]> = ["todo", "in_progress", "done"];
const PRIORITY_ORDER: Array<Task["priority"]> = ["high", "medium", "low"];

const dueDateOptions: Array<{ value: DueDateFilter; label: string }> = [
	{ value: "all", label: "Any due date" },
	{ value: "today", label: "Due today" },
	{ value: "overdue", label: "Overdue" },
	{ value: "this-week", label: "Due this week" },
	{ value: "no-due-date", label: "No due date" },
];

const statusLabelMap: Record<Task["status"], string> = {
	todo: "To do",
	in_progress: "In progress",
	done: "Done",
};

const priorityLabelMap: Record<Task["priority"], string> = {
	high: "High",
	medium: "Medium",
	low: "Low",
};

const assigneeOptions = computed(() => {
	return (teams.value ?? []).map((member) => ({
		label: `${member.firstName} ${member.lastName}`,
		value: member.username,
	}));
});

const getDueDateState = (date: string | null) => {
	if (!date) {
		return "none" as const;
	}

	const now = new Date();
	const due = new Date(date);

	const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
	const nextWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);

	if (due >= todayStart && due < tomorrowStart) {
		return "today" as const;
	}
	if (due < todayStart) {
		return "overdue" as const;
	}
	if (due <= nextWeek) {
		return "this-week" as const;
	}

	return "future" as const;
};

const filteredTasks = computed(() => {
	const source = taskRows.value;

	if (dueDateFilter.value === "all") {
		return source;
	}

	return source.filter((task) => {
		const dueState = getDueDateState(task.dueDate);
		if (dueDateFilter.value === "today") return dueState === "today";
		if (dueDateFilter.value === "overdue") return dueState === "overdue";
		if (dueDateFilter.value === "this-week") return dueState === "today" || dueState === "this-week";
		return dueState === "none";
	});
});

const sortedTasks = computed(() => {
	return [...filteredTasks.value].sort((a, b) => {
		if (!a.dueDate && !b.dueDate) return 0;
		if (!a.dueDate) return 1;
		if (!b.dueDate) return -1;
		return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
	});
});

const groupedTasks = computed(() => {
	if (groupBy.value === "none") {
		return [{ key: "all", label: "All tasks", tasks: sortedTasks.value }];
	}

	if (groupBy.value === "status") {
		return STATUS_ORDER.map((status) => ({
			key: status,
			label: statusLabelMap[status],
			tasks: sortedTasks.value.filter((task) => task.status === status),
		})).filter((group) => group.tasks.length > 0);
	}

	if (groupBy.value === "priority") {
		return PRIORITY_ORDER.map((priority) => ({
			key: priority,
			label: `${priorityLabelMap[priority]} priority`,
			tasks: sortedTasks.value.filter((task) => task.priority === priority),
		})).filter((group) => group.tasks.length > 0);
	}

	const map = new Map<string, Task[]>();
	for (const task of sortedTasks.value) {
		const firstAssignee = task.assignees[0];
		const key = firstAssignee?.username ?? "unassigned";
		const existing = map.get(key) ?? [];
		existing.push(task);
		map.set(key, existing);
	}

	return [...map.entries()].map(([key, value]) => ({
		key,
		label: key === "unassigned" ? "Unassigned" : value[0]?.assignees[0] ? `${value[0].assignees[0].firstName} ${value[0].assignees[0].lastName}` : key,
		tasks: value,
	}));
});

const statusColumns = computed(() => {
	return STATUS_ORDER.map((status) => ({
		key: status,
		label: statusLabelMap[status],
		tasks: sortedTasks.value.filter((task) => task.status === status),
	}));
});

const visibleTaskList = computed(() => groupedTasks.value.flatMap((group) => group.tasks));

watch(
	() => visibleTaskList.value.length,
	(length) => {
		if (length === 0) {
			focusedTaskIndex.value = 0;
			return;
		}
		if (focusedTaskIndex.value >= length) {
			focusedTaskIndex.value = length - 1;
		}
	}
);

watch(
	() => sortedTasks.value.map((task) => task.id),
	(ids) => {
		selectedTaskIds.value = selectedTaskIds.value.filter((id) => ids.includes(id));
	}
);

const focusedTask = computed(() => visibleTaskList.value[focusedTaskIndex.value]);

const dueDateDisplay = (date: string | null) => {
	if (!date) return "No date";
	const state = getDueDateState(date);
	if (state === "today") return "Due today";
	if (state === "overdue") return "Overdue";
	return formatDate(date, "MMM D");
};

const dueDateClass = (date: string | null) => {
	const state = getDueDateState(date);
	if (state === "overdue") return "text-danger";
	if (state === "today") return "text-warning";
	return "text-text-tertiary";
};

const priorityIconClass = (priority: Task["priority"]) => {
	if (priority === "high") return "text-priority-high";
	if (priority === "medium") return "text-priority-medium";
	return "text-priority-low";
};

const toggleTaskSelection = (taskId: string, selected: boolean) => {
	if (selected) {
		if (!selectedTaskIds.value.includes(taskId)) selectedTaskIds.value = [...selectedTaskIds.value, taskId];
		return;
	}
	selectedTaskIds.value = selectedTaskIds.value.filter((id) => id !== taskId);
};

const isTaskSelected = (taskId: string) => selectedTaskIds.value.includes(taskId);

const clearSelection = () => {
	selectedTaskIds.value = [];
};

const setSelectedTask = (task: Task, action: "update" | "delete") => {
	selectedTask.value = task;
	if (action === "delete") isDeleteModalOpen.value = true;
	else if (action === "update") isTaskModalOpen.value = true;
};

const removeSelectedTask = () => {
	isTaskModalOpen.value = false;
	isDeleteModalOpen.value = false;
	selectedTask.value = undefined;
};

const openCreateTaskModal = () => {
	if (!hasWorkspaceContext.value) {
		triggerCreateWorkspace();
		return;
	}
	selectedTask.value = undefined;
	isTaskModalOpen.value = true;
};

const startInlineEdit = (task: Task) => {
	editingTaskId.value = task.id;
	editingTitle.value = task.title;
};

const cancelInlineEdit = () => {
	editingTaskId.value = null;
	editingTitle.value = "";
};

const saveInlineEdit = async (task: Task) => {
	const nextTitle = editingTitle.value.trim();
	if (!nextTitle || nextTitle === task.title) {
		cancelInlineEdit();
		return;
	}

	try {
		await useApiFetch(API_ENDPOINTS.workspaces.taskById(workspaceSlug.value, task.id), {
			method: "PATCH",
			body: { title: nextTitle },
		});
		queryClient.invalidateQueries({ queryKey: ["workspace-tasks", workspaceSlug.value] });
	} finally {
		cancelInlineEdit();
	}
};

const openTaskDetails = async (task: Task) => {
	cancelInlineEdit();
	await navigateTo({
		path: `/app/workspaces/${workspaceSlug.value}/tasks`,
		query: { taskId: task.id },
	});
};

const closeTaskDrawer = async () => {
	await navigateTo(`/app/workspaces/${workspaceSlug.value}/tasks`);
};

const onTaskDeletedFromDrawer = async (deletedTaskId: string) => {
	selectedTaskIds.value = selectedTaskIds.value.filter((id) => id !== deletedTaskId);
	await closeTaskDrawer();
	queryClient.invalidateQueries({ queryKey: ["workspace-tasks", workspaceSlug.value] });
};

const deleteSelectedTask = async () => {
	if (!selectedTask.value) return;

	await useApiFetch(API_ENDPOINTS.workspaces.taskById(workspaceSlug.value, selectedTask.value.id), {
		method: "DELETE",
	});

	selectedTaskIds.value = selectedTaskIds.value.filter((id) => id !== selectedTask.value?.id);
	removeSelectedTask();
	queryClient.invalidateQueries({ queryKey: ["workspace-tasks", workspaceSlug.value] });
};

const bulkPatch = async (payload: Partial<Pick<Task, "status" | "priority">> & { assignees?: string[] }) => {
	if (selectedTaskIds.value.length === 0) return;

	await Promise.all(
		selectedTaskIds.value.map((taskId) =>
			useApiFetch(API_ENDPOINTS.workspaces.taskById(workspaceSlug.value, taskId), {
				method: "PATCH",
				body: payload,
			})
		)
	);

	queryClient.invalidateQueries({ queryKey: ["workspace-tasks", workspaceSlug.value] });
};

const bulkDelete = async () => {
	if (selectedTaskIds.value.length === 0) return;

	await Promise.all(
		selectedTaskIds.value.map((taskId) =>
			useApiFetch(API_ENDPOINTS.workspaces.taskById(workspaceSlug.value, taskId), {
				method: "DELETE",
			})
		)
	);

	clearSelection();
	queryClient.invalidateQueries({ queryKey: ["workspace-tasks", workspaceSlug.value] });
};

const emptyStateAction = () => {
	if (isFilterActive.value) {
		searchInput.value = "";
		filter.search = "";
		filter.status = [];
		filter.priority = [];
		filter.assignee = [];
		dueDateFilter.value = "all";
		return;
	}

	openCreateTaskModal();
};

const onTaskRowNav = (event: Event) => {
	if (viewMode.value !== "list") return;
	const customEvent = event as CustomEvent<{ direction: "j" | "k" }>;
	if (!visibleTaskList.value.length) return;

	if (customEvent.detail.direction === "j") {
		focusedTaskIndex.value = (focusedTaskIndex.value + 1) % visibleTaskList.value.length;
		return;
	}

	focusedTaskIndex.value = (focusedTaskIndex.value - 1 + visibleTaskList.value.length) % visibleTaskList.value.length;
};

const onOpenFocusedTask = async () => {
	if (!focusedTask.value || viewMode.value !== "list") return;
	await openTaskDetails(focusedTask.value);
};

const onCreateTaskIntent = () => {
	openCreateTaskModal();
};

onMounted(() => {
	window.addEventListener("taskgid:task-row-nav", onTaskRowNav as EventListener);
	window.addEventListener("taskgid:open-focused-task-intent", onOpenFocusedTask as EventListener);
	window.addEventListener("taskgid:new-task-intent", onCreateTaskIntent as EventListener);
});

onBeforeUnmount(() => {
	window.removeEventListener("taskgid:task-row-nav", onTaskRowNav as EventListener);
	window.removeEventListener("taskgid:open-focused-task-intent", onOpenFocusedTask as EventListener);
	window.removeEventListener("taskgid:new-task-intent", onCreateTaskIntent as EventListener);
});
</script>

<template>
	<div class="space-y-6 overflow-x-hidden">
		<div class="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
			<div>
				<p class="text-2xs text-text-tertiary mb-2 font-semibold tracking-[0.12em] uppercase">Workspace queue</p>
				<h1 class="linear-title text-xl font-semibold">Tasks</h1>
				<p class="text-text-secondary text-sm">Manage and triage work without losing context.</p>
			</div>

			<div class="flex flex-col gap-2 sm:flex-row sm:items-center">
				<div class="border-border bg-surface-0 inline-flex h-10 w-full items-center rounded-xl border p-1 sm:h-9 sm:w-auto sm:rounded-md">
					<button
						type="button"
						class="interactive flex-1 rounded-lg px-3 py-2 text-sm sm:flex-none sm:rounded-md sm:py-1"
						:class="viewMode === 'list' ? 'bg-accent-subtle text-accent-text' : 'text-text-secondary hover:bg-surface-2'"
						@click="viewMode = 'list'"
					>
						List
					</button>
					<button
						type="button"
						class="interactive flex-1 rounded-lg px-3 py-2 text-sm sm:flex-none sm:rounded-md sm:py-1"
						:class="viewMode === 'board' ? 'bg-accent-subtle text-accent-text' : 'text-text-secondary hover:bg-surface-2'"
						@click="viewMode = 'board'"
					>
						Board
					</button>
				</div>

				<Button class="h-11 w-full shadow-sm sm:h-9 sm:w-auto" @click="openCreateTaskModal">
					<Icon name="lucide:plus" :size="16" />
					New task
				</Button>
				<AppTaskCreateOrEdit v-model="isTaskModalOpen" :is-creating="!selectedTask" :task="selectedTask" hide-trigger @close="removeSelectedTask" />
			</div>
		</div>

		<div class="linear-shell space-y-3 rounded-2xl p-3 sm:rounded-lg">
			<div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
				<div class="relative w-full sm:w-52 sm:transition-all sm:focus-within:w-72">
					<Icon name="lucide:search" :size="16" class="text-text-tertiary pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" />
					<Input v-model="searchInput" class="h-11 rounded-xl pr-8 pl-9 sm:h-9 sm:rounded-full" placeholder="Search tasks..." />
					<button
						v-if="searchInput.length > 0"
						type="button"
						class="interactive text-text-tertiary hover:bg-surface-2 hover:text-text-primary absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1"
						aria-label="Clear search"
						@click="clearSearch"
					>
						<Icon name="lucide:x" :size="14" />
					</button>
				</div>

				<div class="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
					<Popover>
						<PopoverTrigger as-child>
							<button
								type="button"
								class="interactive border-border bg-surface-0 text-text-secondary hover:bg-surface-2 min-h-11 shrink-0 rounded-full border px-4 text-sm sm:h-7 sm:min-h-0 sm:px-3"
							>
								Status
							</button>
						</PopoverTrigger>
						<PopoverContent class="border-border bg-surface-0 w-48 border p-2">
							<div class="space-y-1">
								<label v-for="status in STATUS_ORDER" :key="status" class="hover:bg-surface-2 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm">
									<Checkbox
										:model-value="filter.status.includes(status)"
										@update:model-value="
											(value) => {
												if (value) filter.status = [...filter.status, status];
												else filter.status = filter.status.filter((item) => item !== status);
											}
										"
									/>
									<span>{{ statusLabelMap[status] }}</span>
								</label>
							</div>
						</PopoverContent>
					</Popover>

					<Popover>
						<PopoverTrigger as-child>
							<button
								type="button"
								class="interactive border-border bg-surface-0 text-text-secondary hover:bg-surface-2 min-h-11 shrink-0 rounded-full border px-4 text-sm sm:h-7 sm:min-h-0 sm:px-3"
							>
								Priority
							</button>
						</PopoverTrigger>
						<PopoverContent class="border-border bg-surface-0 w-48 border p-2">
							<div class="space-y-1">
								<label v-for="priority in PRIORITY_ORDER" :key="priority" class="hover:bg-surface-2 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm">
									<Checkbox
										:model-value="filter.priority.includes(priority)"
										@update:model-value="
											(value) => {
												if (value) filter.priority = [...filter.priority, priority];
												else filter.priority = filter.priority.filter((item) => item !== priority);
											}
										"
									/>
									<span>{{ priorityLabelMap[priority] }}</span>
								</label>
							</div>
						</PopoverContent>
					</Popover>

					<Popover>
						<PopoverTrigger as-child>
							<button
								type="button"
								class="interactive border-border bg-surface-0 text-text-secondary hover:bg-surface-2 min-h-11 shrink-0 rounded-full border px-4 text-sm sm:h-7 sm:min-h-0 sm:px-3"
							>
								Assignee
							</button>
						</PopoverTrigger>
						<PopoverContent class="border-border bg-surface-0 w-56 border p-2">
							<div class="space-y-1">
								<label v-for="assignee in assigneeOptions" :key="assignee.value" class="hover:bg-surface-2 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm">
									<Checkbox
										:model-value="filter.assignee.includes(assignee.value)"
										@update:model-value="
											(value) => {
												if (value) filter.assignee = [...filter.assignee, assignee.value];
												else filter.assignee = filter.assignee.filter((item) => item !== assignee.value);
											}
										"
									/>
									<span>{{ assignee.label }}</span>
								</label>
							</div>
						</PopoverContent>
					</Popover>

					<Popover>
						<PopoverTrigger as-child>
							<button
								type="button"
								class="interactive border-border bg-surface-0 text-text-secondary hover:bg-surface-2 min-h-11 shrink-0 rounded-full border px-4 text-sm sm:h-7 sm:min-h-0 sm:px-3"
							>
								Due date
							</button>
						</PopoverTrigger>
						<PopoverContent class="border-border bg-surface-0 w-48 border p-2">
							<div class="space-y-1">
								<button
									v-for="option in dueDateOptions"
									:key="option.value"
									type="button"
									class="interactive hover:bg-surface-2 flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm"
									@click="dueDateFilter = option.value"
								>
									<span>{{ option.label }}</span>
									<Icon v-if="dueDateFilter === option.value" name="lucide:check" :size="14" class="text-primary" />
								</button>
							</div>
						</PopoverContent>
					</Popover>
				</div>

				<div class="flex w-full items-center gap-2 pt-1 sm:ml-auto sm:w-auto sm:pt-0">
					<label class="text-text-secondary shrink-0 text-sm">Group by</label>
					<Select v-model="groupBy">
						<SelectTrigger class="h-11 w-full rounded-xl sm:h-8 sm:w-44 sm:rounded-md">
							<SelectValue placeholder="None" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="none">None</SelectItem>
							<SelectItem value="status">Status</SelectItem>
							<SelectItem value="priority">Priority</SelectItem>
							<SelectItem value="assignee">Assignee</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div v-if="isFilterActive" class="border-border flex flex-wrap gap-2 border-t pt-3">
				<button
					v-for="status in filter.status"
					:key="`status-${status}`"
					type="button"
					class="interactive border-accent/30 bg-accent-subtle text-accent-text inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium"
					@click="filter.status = filter.status.filter((item) => item !== status)"
				>
					Status: {{ statusLabelMap[status as Task["status"]] }}
					<Icon name="lucide:x" :size="12" />
				</button>
				<button
					v-for="priority in filter.priority"
					:key="`priority-${priority}`"
					type="button"
					class="interactive border-accent/30 bg-accent-subtle text-accent-text inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium"
					@click="filter.priority = filter.priority.filter((item) => item !== priority)"
				>
					Priority: {{ priorityLabelMap[priority as Task["priority"]] }}
					<Icon name="lucide:x" :size="12" />
				</button>
				<button
					v-for="assignee in filter.assignee"
					:key="`assignee-${assignee}`"
					type="button"
					class="interactive border-accent/30 bg-accent-subtle text-accent-text inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium"
					@click="filter.assignee = filter.assignee.filter((item) => item !== assignee)"
				>
					Assignee: {{ assignee }}
					<Icon name="lucide:x" :size="12" />
				</button>
				<button
					v-if="dueDateFilter !== 'all'"
					type="button"
					class="interactive border-accent/30 bg-accent-subtle text-accent-text inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium"
					@click="dueDateFilter = 'all'"
				>
					Due: {{ dueDateOptions.find((item) => item.value === dueDateFilter)?.label }}
					<Icon name="lucide:x" :size="12" />
				</button>
				<button type="button" class="text-text-secondary text-xs underline-offset-2 hover:underline" @click="emptyStateAction">Clear filters</button>
			</div>
		</div>

		<AppEmptyState
			v-if="!hasWorkspaceContext"
			heading="Create a workspace first"
			body="Workspace features are available after you create your first workspace."
			icon="lucide:folder-plus"
			:action="{ label: 'Create workspace', onClick: triggerCreateWorkspace }"
		/>

		<div v-else-if="isFetching" class="space-y-2">
			<Skeleton class="h-11 w-full" />
			<Skeleton class="h-11 w-full" />
			<Skeleton class="h-11 w-full" />
		</div>

		<AppEmptyState
			v-else-if="isTasksError"
			heading="Could not load tasks"
			:body="String(tasksError || 'Try again in a moment.')"
			icon="lucide:alert-circle"
			:action="{ label: 'Retry', onClick: () => refetchTasks(), variant: 'secondary' }"
		/>

		<div v-else-if="sortedTasks.length">
			<div v-if="viewMode === 'list'" class="space-y-5">
				<div v-for="group in groupedTasks" :key="group.key" class="space-y-2">
					<div v-if="groupBy !== 'none'" class="text-text-tertiary px-1 text-xs font-semibold tracking-widest uppercase">{{ group.label }}</div>

					<div class="md:border-border md:bg-surface-0 space-y-3 border-0 bg-transparent md:space-y-0 md:rounded-lg md:border">
						<div
							v-for="task in group.tasks"
							:key="task.id"
							class="group border-border/80 bg-surface-0 md:border-border rounded-2xl border px-3 py-3 shadow-[0_1px_0_rgba(15,23,42,0.03)] md:grid md:h-11 md:grid-cols-[24px_88px_minmax(0,1fr)_56px_64px_96px_32px] md:items-center md:gap-2 md:rounded-none md:border-x-0 md:border-t-0 md:border-b md:bg-transparent md:px-3 md:py-0 md:shadow-none first:md:rounded-t-lg last:md:rounded-b-lg last:md:border-b-0"
							:class="{ 'bg-surface-2/60 ring-accent/20 ring-1 md:ring-0': focusedTask?.id === task.id }"
						>
							<div class="space-y-3 md:hidden">
								<div class="flex items-start justify-between gap-3">
									<div class="flex min-w-0 items-center gap-2">
										<Checkbox :model-value="isTaskSelected(task.id)" @update:model-value="(value) => toggleTaskSelection(task.id, Boolean(value))" />
										<BadgeStatus :status="task.status" />
									</div>

									<div class="flex shrink-0 items-center gap-1">
										<Button v-if="editingTaskId !== task.id" variant="ghost" size="icon" class="h-11 w-11 rounded-xl" aria-label="Open task" @click="openTaskDetails(task)">
											<Icon name="lucide:arrow-right" :size="16" />
										</Button>

										<DropdownMenu>
											<DropdownMenuTrigger as-child>
												<Button variant="ghost" size="icon" class="h-11 w-11 rounded-xl" aria-label="Task actions">
													<Icon name="lucide:ellipsis" :size="16" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end" class="border-border bg-surface-0 w-[min(18rem,calc(100vw-1rem))] border">
												<DropdownMenuItem @select="setSelectedTask(task, 'update')">Edit</DropdownMenuItem>
												<DropdownMenuItem @select="openTaskDetails(task)">Open</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem class="text-danger" @select="setSelectedTask(task, 'delete')">Delete</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</div>

								<div class="min-w-0 space-y-2">
									<input
										v-if="editingTaskId === task.id"
										v-model="editingTitle"
										class="border-border bg-surface-0 focus-visible:ring-accent h-11 w-full rounded-xl border px-3 text-sm focus-visible:ring-2"
										@keydown.enter.prevent="saveInlineEdit(task)"
										@keydown.esc.prevent="cancelInlineEdit"
										@blur="saveInlineEdit(task)"
									/>
									<button
										v-else
										type="button"
										class="text-text-primary line-clamp-3 w-full text-left text-sm leading-6 font-semibold"
										:class="task.status === 'done' ? 'text-text-tertiary line-through' : ''"
										@click="startInlineEdit(task)"
									>
										{{ task.title }}
									</button>

									<div class="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
										<div class="border-border bg-surface-1 text-text-secondary inline-flex h-8 shrink-0 items-center gap-1 rounded-full border px-2.5 text-xs">
											<Icon name="lucide:triangle-alert" :class="['h-3 w-3 fill-current', priorityIconClass(task.priority)]" />
											<span>{{ priorityLabelMap[task.priority] }}</span>
										</div>
										<p class="border-border bg-surface-1 shrink-0 rounded-full border px-2.5 py-1.5 text-xs" :class="dueDateClass(task.dueDate)">
											{{ dueDateDisplay(task.dueDate) }}
										</p>
										<div v-if="task.assignees.length" class="border-border bg-surface-1 inline-flex h-8 shrink-0 items-center gap-2 rounded-full border px-2.5 text-xs">
											<Avatar class="h-5 w-5">
												<AvatarImage :src="task.assignees[0].profilePicture || ''" :alt="task.assignees[0].username" />
												<AvatarFallback class="bg-accent-subtle text-accent-text text-2xs">{{
													getInitials(task.assignees[0].firstName, task.assignees[0].lastName)
												}}</AvatarFallback>
											</Avatar>
											<span>{{ task.assignees[0].firstName }}</span>
										</div>
										<div v-else class="border-border bg-surface-1 text-text-tertiary inline-flex h-8 shrink-0 items-center rounded-full border px-2.5 text-xs">Unassigned</div>
									</div>
								</div>
							</div>

							<div :class="isTaskSelected(task.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'" class="interactive hidden md:block">
								<Checkbox :model-value="isTaskSelected(task.id)" @update:model-value="(value) => toggleTaskSelection(task.id, Boolean(value))" />
							</div>

							<div class="hidden md:block">
								<BadgeStatus :status="task.status" />
							</div>

							<div class="hidden min-w-0 items-center gap-1 md:flex">
								<input
									v-if="editingTaskId === task.id"
									v-model="editingTitle"
									class="border-border bg-surface-0 focus-visible:ring-accent h-8 w-full rounded-md border px-2 text-sm focus-visible:ring-2"
									@keydown.enter.prevent="saveInlineEdit(task)"
									@keydown.esc.prevent="cancelInlineEdit"
									@blur="saveInlineEdit(task)"
								/>
								<button
									v-else
									type="button"
									class="text-text-primary hover:text-primary cursor-pointer truncate text-left text-base"
									:class="task.status === 'done' ? 'text-text-tertiary line-through' : ''"
									@click="startInlineEdit(task)"
								>
									{{ task.title }}
								</button>

								<Button v-if="editingTaskId !== task.id" variant="ghost" size="icon" class="h-7 w-7 cursor-pointer" aria-label="Open task" @click="openTaskDetails(task)">
									<Icon name="lucide:arrow-right" :size="14" />
								</Button>
							</div>

							<Icon name="lucide:triangle-alert" class="hidden md:block" :class="['h-3 w-3 fill-current', priorityIconClass(task.priority)]" />

							<div class="hidden md:flex">
								<Avatar v-if="task.assignees.length" class="h-6 w-6">
									<AvatarImage :src="task.assignees[0].profilePicture || ''" :alt="task.assignees[0].username" />
									<AvatarFallback class="bg-accent-subtle text-accent-text text-2xs">{{ getInitials(task.assignees[0].firstName, task.assignees[0].lastName) }}</AvatarFallback>
								</Avatar>
							</div>

							<p class="hidden text-xs md:block" :class="dueDateClass(task.dueDate)">{{ dueDateDisplay(task.dueDate) }}</p>

							<div class="hidden md:block">
								<DropdownMenu>
									<DropdownMenuTrigger as-child>
										<Button variant="ghost" size="icon" class="h-8 w-8" aria-label="Task actions">
											<Icon name="lucide:ellipsis" :size="16" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" class="border-border bg-surface-0 border">
										<DropdownMenuItem @select="setSelectedTask(task, 'update')">Edit</DropdownMenuItem>
										<DropdownMenuItem @select="openTaskDetails(task)">Open</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem class="text-danger" @select="setSelectedTask(task, 'delete')">Delete</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div v-else class="overflow-x-auto pb-2">
				<div class="flex min-w-[760px] snap-x snap-mandatory gap-4">
					<section v-for="column in statusColumns" :key="column.key" class="border-border bg-surface-0 w-full min-w-[240px] snap-start rounded-lg border p-3">
						<div class="mb-3 flex items-center justify-between">
							<p class="text-text-primary text-sm font-medium">{{ column.label }}</p>
							<span class="border-border text-2xs text-text-tertiary rounded-full border px-2 py-0.5">{{ column.tasks.length }}</span>
						</div>

						<div class="max-h-112 space-y-2 overflow-y-auto">
							<article
								v-for="task in column.tasks"
								:key="task.id"
								class="interactive border-border bg-surface-0 hover:bg-surface-1 cursor-pointer rounded-lg border p-3"
								@click="openTaskDetails(task)"
							>
								<p class="text-text-primary line-clamp-2 text-sm">{{ task.title }}</p>
								<div class="mt-3 flex items-center justify-between">
									<div class="flex items-center gap-2">
										<Icon name="lucide:triangle-alert" :class="['h-3 w-3 fill-current', priorityIconClass(task.priority)]" />
										<Avatar v-if="task.assignees.length" class="h-6 w-6">
											<AvatarImage :src="task.assignees[0].profilePicture || ''" :alt="task.assignees[0].username" />
											<AvatarFallback class="bg-accent-subtle text-accent-text text-2xs">{{
												getInitials(task.assignees[0].firstName, task.assignees[0].lastName)
											}}</AvatarFallback>
										</Avatar>
									</div>
									<span class="text-2xs" :class="dueDateClass(task.dueDate)">{{ dueDateDisplay(task.dueDate) }}</span>
								</div>
							</article>
						</div>

						<Button variant="ghost" size="sm" class="mt-3 h-8 w-full" @click="openCreateTaskModal">Add task</Button>
					</section>
				</div>
			</div>
		</div>

		<AppEmptyState
			v-else
			:heading="emptyStateCopy.heading"
			:body="emptyStateCopy.body"
			icon="lucide:list-checks"
			:action="{ label: emptyStateCopy.actionLabel, onClick: emptyStateAction, variant: isFilterActive ? 'secondary' : 'primary' }"
		/>

		<AppDeleteAction
			v-model="isDeleteModalOpen"
			title="Delete task?"
			description="Are you sure you want to delete this task? This action cannot be undone."
			@cancel="isDeleteModalOpen = false"
			@confirm="deleteSelectedTask"
		/>

		<AppTaskDrawer :open="isTaskDrawerOpen" :task-id="activeTaskId" @close="closeTaskDrawer" @deleted="onTaskDeletedFromDrawer" />

		<div v-if="selectedTaskIds.length > 0" class="fixed inset-x-4 bottom-4 z-50 sm:right-auto sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2">
			<div
				class="bg-text-primary text-surface-0 flex min-h-12 flex-wrap items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium shadow-xl sm:h-12 sm:flex-nowrap sm:rounded-full sm:px-5 sm:py-0"
			>
				<button type="button" class="interactive rounded-full p-1 hover:bg-white/15" aria-label="Clear selection" @click="clearSelection">
					<Icon name="lucide:x" :size="14" />
				</button>
				<span>{{ selectedTaskIds.length }} selected</span>
				<div class="hidden h-5 w-px bg-white/25 sm:block" />

				<DropdownMenu>
					<DropdownMenuTrigger as-child>
						<Button variant="ghost" size="sm" class="text-surface-0 hover:text-surface-0 h-9 px-2 hover:bg-white/15">Assign</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="center" class="border-border bg-surface-0 border">
						<DropdownMenuItem v-for="assignee in assigneeOptions" :key="assignee.value" @select="bulkPatch({ assignees: [assignee.value] })">
							{{ assignee.label }}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				<DropdownMenu>
					<DropdownMenuTrigger as-child>
						<Button variant="ghost" size="sm" class="text-surface-0 hover:text-surface-0 h-9 px-2 hover:bg-white/15">Set status</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="center" class="border-border bg-surface-0 border">
						<DropdownMenuItem v-for="status in STATUS_ORDER" :key="status" @select="bulkPatch({ status })">{{ statusLabelMap[status] }}</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				<DropdownMenu>
					<DropdownMenuTrigger as-child>
						<Button variant="ghost" size="sm" class="text-surface-0 hover:text-surface-0 h-9 px-2 hover:bg-white/15">Set priority</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="center" class="border-border bg-surface-0 border">
						<DropdownMenuItem v-for="priority in PRIORITY_ORDER" :key="priority" @select="bulkPatch({ priority })">{{ priorityLabelMap[priority] }}</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				<Button variant="ghost" size="sm" class="text-surface-0 hover:text-surface-0 h-9 px-2 hover:bg-white/15" @click="isBulkActionMenuOpen = true">Delete</Button>

				<AppDeleteAction
					v-model="isBulkActionMenuOpen"
					:title="selectedTaskIds.length > 1 ? 'Delete tasks?' : 'Delete task?'"
					:description="
						selectedTaskIds.length > 1
							? 'Are you sure you want to delete these tasks? This action cannot be undone.'
							: 'Are you sure you want to delete this task? This action cannot be undone.'
					"
					@cancel="isBulkActionMenuOpen = false"
					@confirm="bulkDelete"
				/>
			</div>
		</div>
	</div>
</template>
