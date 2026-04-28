<script lang="ts" setup>
import { useQuery, useQueryClient } from "@tanstack/vue-query"
import { toast } from "vue-sonner"
import type { Task } from "~/types"

definePageMeta({ name: "task-id", layout: "workspace" });

const route = useRoute();
const client = useQueryClient();

const workspaceSlug = computed(() => String(route.params.slug ?? ""));
const taskId = computed(() => String(route.params.id ?? ""));
const isDeleteModalOpen = ref(false);

const {
	data: task,
	isFetching: isTaskLoading,
	isError: isTaskError,
	error: taskError,
	refetch: refetchTask,
} = useQuery({
	queryKey: computed(() => ["task", taskId.value]),
	queryFn: async () => {
		const { success, data } = await useApiFetch<{ success: boolean; data: Task }>(API_ENDPOINTS.workspaces.taskById(workspaceSlug.value, taskId.value));
		if (!success || !data) {
			throw new Error("Failed to fetch task");
		}
		return data;
	},
	enabled: computed(() => Boolean(workspaceSlug.value && taskId.value)),
});

const goBackToList = async () => {
	await navigateTo(`/app/workspaces/${workspaceSlug.value}/tasks`);
};

const deleteTask = async () => {
	if (!task.value?.id) {
		return;
	}

	await useApiFetch(API_ENDPOINTS.workspaces.taskById(workspaceSlug.value, task.value.id), {
		method: "DELETE",
	});

	await client.invalidateQueries({ queryKey: ["workspace-tasks", workspaceSlug.value] });
	toast.success("Task deleted successfully.");
	await goBackToList();
};
</script>

<template>
	<div class="mx-auto w-full max-w-[1200px] overflow-x-hidden px-4 py-4 sm:px-6 lg:px-8">
		<header class="mb-5 flex items-center justify-between">
			<Button variant="ghost" class="h-11 px-2" @click="goBackToList">
				<Icon name="lucide:arrow-left" :size="16" />
				<span>Back to list</span>
			</Button>

			<DropdownMenu>
				<DropdownMenuTrigger as-child>
					<Button variant="ghost" size="icon" class="h-11 w-11" aria-label="More actions">
						<Icon name="lucide:ellipsis" :size="16" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" class="border-border bg-surface-0 w-[min(20rem,calc(100vw-1rem))] border sm:w-56">
					<DropdownMenuItem class="text-destructive focus:text-destructive" @select="isDeleteModalOpen = true">
						<Icon name="lucide:trash-2" :size="14" />
						<span>Delete task</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</header>

		<div v-if="isTaskLoading" class="space-y-4">
			<Skeleton class="h-10 w-2/3" />
			<Skeleton class="h-10 w-full" />
			<Skeleton class="h-40 w-full" />
		</div>

		<AppEmptyState
			v-else-if="isTaskError"
			heading="Could not load task"
			:body="String(taskError || 'Please try again.')"
			icon="lucide:alert-circle"
			:action="{ label: 'Retry', onClick: () => refetchTask(), variant: 'secondary' }"
		/>

		<div v-else-if="task" class="flex flex-col gap-8 lg:flex-row lg:items-start">
			<main class="min-w-0 flex-1 space-y-6 lg:basis-[70%]">
				<div class="lg:hidden">
					<AppTaskMetadataHorizontal :task="task" />
				</div>

				<AppTaskDescriptionEditor :task="task" :workspace-slug="workspaceSlug" />
				<AppTaskTimeline :workspace-slug="workspaceSlug" :task-id="task.id" />
			</main>

			<aside class="border-border lg:sticky lg:top-6 lg:basis-[30%] lg:border-l lg:pl-6">
				<div class="hidden lg:block">
					<AppTaskMetadataVertical :task="task" />
				</div>

				<div class="border-border mt-4 space-y-3 border-t pt-5 lg:hidden">
					<p class="text-text-tertiary text-xs font-semibold tracking-widest uppercase">Advanced</p>
					<p class="text-text-tertiary text-sm">Attachments and subtasks are coming soon.</p>
				</div>
			</aside>
		</div>

		<AppDeleteAction
			v-model="isDeleteModalOpen"
			title="Delete task?"
			description="Are you sure you want to delete this task? This action cannot be undone."
			@cancel="isDeleteModalOpen = false"
			@confirm="deleteTask"
		/>
	</div>
</template>
