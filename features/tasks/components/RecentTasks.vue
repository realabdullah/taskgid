<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import type { PaginatedResponse, Task } from "~/types";
import TaskRow from "./TaskRow.vue";

const RECENT_TASK_COUNT = 10;

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
		const { success, data: tasks } = await useApiFetch<PaginatedResponse<Task>>(API_ENDPOINTS.workspaces.tasks(workspaceSlug.value), { query: { page: 1, limit: RECENT_TASK_COUNT } });
		if (!tasks || !success) throw new Error("Unable to load workspace tasks. Try again.");
		return tasks;
	},
	enabled: computed(() => Boolean(workspaceSlug.value)),
});

const openTaskWorkbench = () => {
	if (!hasWorkspaceContext.value) {
		triggerCreateWorkspace();
		return;
	}
	navigateTo(`/app/workspaces/${workspaceSlug.value}/tasks?create=task`);
};
</script>

<template>
	<div class="product-panel overflow-hidden">
		<AppEmptyState
			v-if="!hasWorkspaceContext"
			heading="Create a workspace first"
			body="Recent tasks appear once you create your first workspace."
			icon="lucide:folder-plus"
			:action="{ label: 'Create workspace', onClick: triggerCreateWorkspace }"
		/>

		<div v-else-if="isRecentTasksLoading" class="space-y-px py-2">
			<Skeleton class="h-16 w-full" />
			<Skeleton class="h-16 w-full" />
			<Skeleton class="h-16 w-full" />
		</div>

		<AppEmptyState
			v-else-if="isRecentTasksError"
			heading="Unable to load recent tasks"
			:body="String(recentTasksError || 'Check your connection and try again.')"
			icon="lucide:alert-circle"
			:action="{ label: 'Retry', onClick: () => refetchRecentTasks(), variant: 'secondary' }"
		/>

		<template v-else-if="recentTasks?.length">
			<TaskRow v-for="task in recentTasks" :key="task.id" :task="task" />
		</template>

		<AppEmptyState v-else heading="No tasks yet" body="Create a task to start organizing work in this workspace." :action="{ label: 'Create task', onClick: openTaskWorkbench }" />
	</div>
</template>
