<script lang="ts" setup>
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import type { Task } from "~/types";

definePageMeta({ name: "task-id", layout: "workspace" });

const route = useRoute();
const client = useQueryClient();

const workspaceSlug = computed(() => String(route.params.slug ?? ""));
const taskId = computed(() => String(route.params.id ?? ""));
const isDeleteModalOpen = ref(false);
const isTaskEditorOpen = ref(false);

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

const openTaskEditor = () => {
	// Let the action menu finish closing before the dialog takes focus.
	// This avoids Reka restoring focus to the menu trigger and immediately dismissing the editor.
	window.setTimeout(() => {
		isTaskEditorOpen.value = true;
	}, 0);
};
</script>

<template>
	<div class="mx-auto w-full max-w-[1440px] overflow-x-hidden px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
		<header class="border-border mb-10 flex items-center justify-between border-b pb-4">
			<Button variant="ghost" class="h-11 px-2" @click="goBackToList">
				<Icon name="lucide:arrow-left" :size="16" />
				<span>All tasks</span>
			</Button>

			<div class="flex items-center gap-2">
				<Button variant="secondary" class="h-10" :disabled="!task" @click="openTaskEditor"><Icon name="lucide:pencil" :size="15" /> Edit task</Button>
				<DropdownMenu>
					<DropdownMenuTrigger as-child>
						<Button variant="ghost" size="icon" class="h-10 w-10" aria-label="More actions">
							<Icon name="lucide:ellipsis" :size="16" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" class="border-border bg-surface-0 w-[min(20rem,calc(100vw-1rem))] border sm:w-56">
						<DropdownMenuItem variant="destructive" :disabled="!task" @select="isDeleteModalOpen = true">
							<Icon name="lucide:trash-2" :size="14" />
							<span>Delete task</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
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

		<div v-else-if="task" class="grid gap-y-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-x-14">
			<main class="min-w-0">
				<section class="border-border border-y py-8 sm:py-10">
					<div class="mb-7 flex items-center justify-between gap-4">
						<p class="editorial-kicker">Task · {{ task.id }}</p>
						<BadgeStatus :status="task.status" />
					</div>
					<AppTaskDescriptionEditor :task="task" :workspace-slug="workspaceSlug" />
				</section>

				<div class="py-6 lg:hidden">
					<AppTaskMetadataHorizontal :task="task" />
				</div>

				<section class="border-border border-t pt-8 sm:pt-10">
					<AppTaskTimeline :workspace-slug="workspaceSlug" :task-id="task.id" />
				</section>
			</main>

			<aside class="border-border bg-surface-1 self-start border-y lg:sticky lg:top-6 lg:border-y-0 lg:border-l">
				<div class="p-6 lg:p-7">
					<p class="editorial-kicker mb-7">Task details</p>
					<div class="hidden lg:block">
						<AppTaskMetadataVertical :task="task" />
					</div>
					<p class="text-text-tertiary text-sm lg:mt-10">All task updates and comments are recorded in the activity section.</p>
				</div>
			</aside>
		</div>

		<AppTaskCreateOrEdit v-if="task" v-model="isTaskEditorOpen" :task="task" hide-trigger />

		<AppDeleteAction
			v-model="isDeleteModalOpen"
			title="Delete task?"
			description="Are you sure you want to delete this task? This action cannot be undone."
			@cancel="isDeleteModalOpen = false"
			@confirm="deleteTask"
		/>
	</div>
</template>
