<script lang="ts" setup>
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import type { Task } from "~/types";

const props = defineProps<{
	open: boolean;
	taskId: string | null;
}>();

const emits = defineEmits<{
	(event: "close"): void;
	(event: "deleted", taskId: string): void;
}>();

const route = useRoute();
const client = useQueryClient();
const workspaceSlug = computed(() => String(route.params.slug ?? ""));
const isDeleteModalOpen = ref(false);

const {
	data: task,
	isFetching: isTaskLoading,
	isError: isTaskError,
	error: taskError,
	refetch: refetchTask,
} = useQuery({
	queryKey: computed(() => ["task", props.taskId]),
	enabled: computed(() => props.open && Boolean(props.taskId)),
	queryFn: async () => {
		const { success, data } = await useApiFetch<{ success: boolean; data: Task }>(API_ENDPOINTS.workspaces.taskById(workspaceSlug.value, props.taskId));
		if (!success || !data) {
			throw new Error("Failed to fetch task");
		}
		return data;
	},
});

const onSheetOpenChange = (nextOpen: boolean) => {
	if (!nextOpen) {
		emits("close");
	}
};

const openFullPage = async () => {
	if (!task.value?.id) {
		return;
	}
	await navigateTo(`/app/workspaces/${workspaceSlug.value}/tasks/${task.value.id}`);
};

const deleteTask = async () => {
	if (!task.value?.id) {
		return;
	}

	await useApiFetch(API_ENDPOINTS.workspaces.taskById(workspaceSlug.value, task.value.id), {
		method: "DELETE",
	});

	client.invalidateQueries({ queryKey: ["workspace-tasks", workspaceSlug.value] });
	toast.success("Task deleted successfully.");
	emits("deleted", task.value.id);
};
</script>

<template>
	<Sheet :open="props.open" @update:open="onSheetOpenChange">
		<SheetContent side="right" :hide-close="true" class="bg-surface-0 inset-0 h-full w-full border-0 p-0 sm:inset-y-0 sm:right-0 sm:left-auto sm:max-w-[600px] sm:border-l lg:max-w-[800px]">
			<div class="flex h-full flex-col overflow-hidden overflow-x-hidden">
				<header class="linear-rule border-border flex items-center justify-between border-b px-6 py-4">
					<div class="min-w-0">
						<Button variant="ghost" class="h-11 px-2 sm:hidden" @click="emits('close')">
							<Icon name="lucide:arrow-left" :size="16" />
							<span>Back</span>
						</Button>
						<div class="hidden sm:block">
							<p class="text-text-tertiary truncate text-xs">Workspace / Tasks / {{ task?.id || "Task" }}</p>
							<p class="text-text-primary mt-1 text-sm font-medium">Task details</p>
						</div>
					</div>
					<div class="flex items-center gap-2">
						<Button variant="ghost" size="icon" class="hidden h-11 w-11 sm:inline-flex" aria-label="Open full page" @click="openFullPage">
							<Icon name="lucide:expand" :size="16" />
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

						<Button variant="ghost" size="icon" class="h-11 w-11" aria-label="Close drawer" @click="emits('close')">
							<Icon name="lucide:x" :size="14" />
						</Button>
					</div>
				</header>

				<div class="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
					<div v-if="isTaskLoading" class="space-y-3">
						<Skeleton class="h-8 w-3/4" />
						<Skeleton class="h-10 w-full" />
						<Skeleton class="h-30 w-full" />
					</div>

					<AppEmptyState
						v-else-if="isTaskError"
						heading="Could not load task"
						:body="String(taskError || 'Please try again.')"
						icon="lucide:alert-circle"
						:action="{ label: 'Retry', onClick: () => refetchTask(), variant: 'secondary' }"
					/>

					<div v-else-if="task" class="space-y-6">
						<AppTaskDescriptionEditor :task="task" :workspace-slug="workspaceSlug" />
						<AppTaskMetadataHorizontal :task="task" />
						<AppTaskTimeline :workspace-slug="workspaceSlug" :task-id="task.id" />
					</div>
				</div>
			</div>
		</SheetContent>
	</Sheet>

	<AppDeleteAction
		v-model="isDeleteModalOpen"
		title="Delete task?"
		description="Are you sure you want to delete this task? This action cannot be undone."
		@cancel="isDeleteModalOpen = false"
		@confirm="deleteTask"
	/>
</template>
