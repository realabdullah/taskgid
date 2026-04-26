<script lang="ts" setup>
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import type { ActivityDetails, Task } from "~/types";

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

const {
	data: activities,
	isFetching: isActivitiesLoading,
	isError: isActivitiesError,
	error: activitiesError,
	refetch: refetchActivities,
} = useQuery({
	queryKey: computed(() => ["task-activities", props.taskId]),
	enabled: computed(() => props.open && Boolean(props.taskId)),
	queryFn: async () => {
		const { success, data } = await useApiFetch<{ success: boolean; data: ActivityDetails[] }>(API_ENDPOINTS.workspaces.taskActivities(workspaceSlug.value, props.taskId));
		if (!success || !data) {
			throw new Error("Failed to fetch task activities");
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
		<SheetContent side="right" class="border-border bg-surface-0 w-full border-l p-0 sm:max-w-[680px]">
			<div class="flex h-full flex-col overflow-hidden">
				<header class="linear-rule border-border flex items-center justify-between border-b px-6 py-4">
					<div class="min-w-0">
						<p class="text-text-tertiary truncate text-xs">Workspace / Tasks / {{ task?.title || "Task" }}</p>
						<p class="text-text-primary mt-1 text-sm font-medium">Task details</p>
					</div>
					<div class="flex items-center gap-2">
						<Button variant="ghost" size="icon" class="h-8 w-8" aria-label="Open full page" @click="openFullPage">
							<Icon name="lucide:external-link" :size="14" />
						</Button>
						<Button variant="ghost" size="icon" class="h-8 w-8" aria-label="Close drawer" @click="emits('close')">
							<Icon name="lucide:x" :size="14" />
						</Button>
					</div>
				</header>

				<div class="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px]">
					<div class="min-h-0 overflow-y-auto px-6 py-5">
						<div v-if="isTaskLoading" class="space-y-3">
							<Skeleton class="h-8 w-3/4" />
							<Skeleton class="h-18 w-full" />
							<Skeleton class="h-30 w-full" />
						</div>

						<AppEmptyState
							v-else-if="isTaskError"
							heading="Could not load task"
							:body="String(taskError || 'Please try again.')"
							icon="lucide:alert-circle"
							:action="{ label: 'Retry', onClick: () => refetchTask(), variant: 'secondary' }"
						/>

						<div v-else-if="task" class="space-y-5">
							<div>
								<h2 class="text-text-primary text-xl font-semibold">{{ task.title }}</h2>
								<p class="text-text-secondary mt-3 text-sm leading-normal whitespace-pre-wrap">{{ task.description || "No description yet." }}</p>
							</div>

							<div class="border-border bg-surface-1 rounded-lg border p-4">
								<p class="text-text-tertiary mb-2 text-xs font-semibold tracking-widest uppercase">Activity</p>
								<div v-if="isActivitiesLoading" class="space-y-2">
									<Skeleton class="h-6 w-full" />
									<Skeleton class="h-6 w-full" />
								</div>
								<div v-else-if="isActivitiesError" class="border-border bg-surface-0 rounded-md border p-3">
									<p class="text-danger text-sm">{{ String(activitiesError || "Could not load activity.") }}</p>
									<Button variant="secondary" size="sm" class="mt-2 h-7" @click="refetchActivities">Retry</Button>
								</div>
								<div v-else-if="activities?.length" class="space-y-3">
									<div v-for="activity in activities" :key="activity.id" class="text-text-secondary flex items-start gap-2 text-xs">
										<Avatar class="h-6 w-6">
											<AvatarImage :src="activity.user.profilePicture || ''" :alt="activity.user.username" />
											<AvatarFallback class="bg-accent-subtle text-accent-text">{{ getInitials(activity.user.firstName, activity.user.lastName) }}</AvatarFallback>
										</Avatar>
										<div>
											<p class="text-text-primary text-sm">{{ activity.action.replaceAll("_", " ") }}</p>
											<p class="text-2xs text-text-tertiary">{{ getTimeAgo(new Date(activity.createdAt)) }}</p>
										</div>
									</div>
								</div>
								<p v-else class="text-text-tertiary text-sm">No activity yet.</p>
							</div>

							<AppTaskComments />
						</div>
					</div>

					<aside class="border-border bg-surface-1 border-t px-5 py-5 lg:border-t-0 lg:border-l">
						<div v-if="task" class="space-y-5">
							<div>
								<p class="text-text-tertiary mb-2 text-xs font-semibold tracking-widest uppercase">Status</p>
								<BadgeStatus :status="task.status" />
							</div>

							<div>
								<p class="text-text-tertiary mb-2 text-xs font-semibold tracking-widest uppercase">Priority</p>
								<BadgePriority :priority="task.priority" />
							</div>

							<div>
								<p class="text-text-tertiary mb-2 text-xs font-semibold tracking-widest uppercase">Due date</p>
								<p class="text-text-secondary text-sm">{{ task.dueDate ? formatDate(task.dueDate, "MMM D, YYYY") : "No date" }}</p>
							</div>

							<div>
								<p class="text-text-tertiary mb-2 text-xs font-semibold tracking-widest uppercase">Assignees</p>
								<div v-if="task.assignees.length" class="space-y-2">
									<div v-for="assignee in task.assignees" :key="assignee.id" class="flex items-center gap-2">
										<Avatar class="h-6 w-6">
											<AvatarImage :src="assignee.profilePicture || ''" :alt="assignee.username" />
											<AvatarFallback class="bg-accent-subtle text-accent-text text-2xs">{{ getInitials(assignee.firstName, assignee.lastName) }}</AvatarFallback>
										</Avatar>
										<span class="text-text-secondary text-sm">{{ assignee.firstName }} {{ assignee.lastName }}</span>
									</div>
								</div>
								<p v-else class="text-text-tertiary text-sm">Unassigned</p>
							</div>

							<div class="pt-3">
								<Button variant="destructive" class="w-full" @click="isDeleteModalOpen = true">Delete task</Button>
							</div>
						</div>
					</aside>
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
