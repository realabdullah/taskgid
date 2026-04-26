<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import type { Task, Pagination } from "~/types";

const route = useRoute();
const workspaceSlug = computed(() => (typeof route.params.slug === "string" ? route.params.slug : ""));
const hasWorkspaceContext = computed(() => Boolean(workspaceSlug.value));
const triggerCreateWorkspace = () => {
	if (!import.meta.client) {
		return;
	}
	globalThis.window.dispatchEvent(new globalThis.CustomEvent("taskgid:add-workspace-intent"));
};

const {
	data: recentTasks,
	isPending: isRecentTasksLoading,
	isError: isRecentTasksError,
	error: recentTasksError,
	refetch: refetchRecentTasks,
} = useQuery({
	queryKey: ["workspace-recent-tasks", workspaceSlug],
	queryFn: async () => {
		const { success, data: tasks } = await useApiFetch<{ success: boolean; data: Task[]; pagination: Pagination }>(`/workspaces/${workspaceSlug.value}/tasks`);
		if (!tasks || !success) throw new Error("Failed to fetch workspace tasks");
		return tasks;
	},
	enabled: computed(() => Boolean(workspaceSlug.value)),
});

const { deleteTask } = useTasks();

const isTaskModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const selectedTask = ref<Task>();

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

const onCreateTaskIntent = () => {
	openCreateTaskModal();
};

onMounted(() => {
	globalThis.window.addEventListener("taskgid:new-task-intent", onCreateTaskIntent);
});

onBeforeUnmount(() => {
	globalThis.window.removeEventListener("taskgid:new-task-intent", onCreateTaskIntent);
});
</script>

<template>
	<div class="space-y-4">
		<AppEmptyState
			v-if="!hasWorkspaceContext"
			heading="Create a workspace first"
			body="Recent tasks appear once you create your first workspace."
			icon="lucide:folder-plus"
			:action="{ label: 'Create workspace', onClick: triggerCreateWorkspace }"
		/>

		<div v-else-if="isRecentTasksLoading" class="space-y-2">
			<Skeleton class="h-20 w-full" />
			<Skeleton class="h-20 w-full" />
			<Skeleton class="h-20 w-full" />
		</div>

		<AppEmptyState
			v-else-if="isRecentTasksError"
			heading="Could not load recent tasks"
			:body="String(recentTasksError || 'Try again in a moment.')"
			icon="lucide:alert-circle"
			:action="{ label: 'Retry', onClick: () => refetchRecentTasks(), variant: 'secondary' }"
		/>

		<template v-else-if="recentTasks?.length">
			<AppTaskCard v-for="task in recentTasks" :key="task.id" :task="task" @edit="setSelectedTask(task, 'update')" @delete="setSelectedTask(task, 'delete')" />
		</template>

		<AppEmptyState
			v-else
			heading="No tasks yet"
			body="Create your first task to start organizing work and moving things forward."
			:action="{ label: 'Create task', onClick: openCreateTaskModal }"
		/>

		<AppDeleteAction
			v-model="isDeleteModalOpen"
			title="Delete task?"
			description="Are you sure you want to delete this task? This action cannot be undone."
			@cancel="isDeleteModalOpen = false"
			@confirm="deleteTask(selectedTask?.id || '', removeSelectedTask)"
		/>

		<AppTaskCreateOrEdit v-model="isTaskModalOpen" :is-creating="!selectedTask" :task="selectedTask" hide-trigger @close="removeSelectedTask" />
	</div>
</template>
