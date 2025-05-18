<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import type { ActivityDetails, Task } from "~/types";

definePageMeta({ name: "task-id", layout: "workspace" });

const { deleteTask } = useTasks();
const { getLabel, getDescription } = useActivityLabel();
const route = useRoute();
const client = useQueryClient();
const { teams } = storeToRefs(useWorkspaceStore());

const { data: task } = useQuery({
	queryKey: ["task", route.params.id],
	queryFn: async () => {
		const { success, data } = await useApiFetch<{ success: boolean; data: Task }>(`/workspaces/${useRoute().params.slug}/tasks/${route.params.id}`);
		if (!data || !success) throw new Error("Failed to fetch task");
		return data;
	},
	select: (data) => {
		taskActionUpdate.priority = data.priority;
		for (const action in taskActionUpdate) {
			const key = action as keyof typeof data;
			if (data?.[key]) {
				if (key === "assignees") {
					taskActionUpdate[key] = data.assignees.map(({ id }) => id);
				} else (taskActionUpdate[key] as unknown as string) = data[key] as unknown as string;
			}
		}
		return data;
	},
});

const { data: activities } = useQuery({
	queryKey: ["task-activities", route.params.id],
	queryFn: async () => {
		const { success, data } = await useApiFetch<{ success: boolean; data: ActivityDetails[] }>(`/workspaces/${useRoute().params.slug}/tasks/${route.params.id}/activities`);
		if (!data || !success) throw new Error("Failed to fetch task activities");
		return data;
	},
});

useHead({
	title: () => task.value?.title,
	meta: [{ name: "description", content: () => task.value?.description }],
});

const isDeleteModalOpen = ref(false);
const isUpdatingTask = ref(false);
const selectedAction = ref();
const taskActionUpdate = shallowReactive<{ [key: string]: any }>({ status: "", priority: "", assignees: [], dueDate: "" });

const options = computed(() => {
	if (selectedAction.value === "status") return taskStatuses;
	else if (selectedAction.value === "priority") return taskPriorities;
	else return [];
});

const addOrRemoveAssignee = (id: string) => {
	if (taskActionUpdate.assignees.includes(id)) (taskActionUpdate.assignees as string[]).filter((assignee) => assignee !== id);
	else (taskActionUpdate.assignees as string[]).push(id);
};

const updateTaskProperties = async () => {
	try {
		isUpdatingTask.value = true;
		const url = `/workspaces/${route.params.slug}/tasks/${task.value?.id}`;
		const { data, success, error } = await useApiFetch<{ success: boolean; data: Task; error?: string }>(url, {
			method: "PATCH",
			body: { [selectedAction.value]: taskActionUpdate[selectedAction.value] },
		});
		if (!data || !success) throw new Error(error || "Failed to update task");
		client.invalidateQueries({ queryKey: ["task", route.params.id] });

		const actionLabel = taskActionsLabelMap[selectedAction.value].label;
		toast.success(`${actionLabel} updated successfully.`);
	} catch (error: any) {
		const actionLabel = taskActionsLabelMap[selectedAction.value].label;
		toast.error(`Failed to update ${actionLabel}: ${error.message || error}`);
	} finally {
		isUpdatingTask.value = false;
	}
};

const goToTasks = () => {
	return navigateTo({ name: "tasks" });
};
</script>

<template>
	<div class="space-y-6">
		<div class="flex items-center gap-4">
			<Button variant="outline" size="icon" as-child>
				<NuxtLink :to="`/app/workspaces/${route.params.slug}/tasks`">
					<Icon name="hugeicons:link-backward" :size="16" />
					<span class="sr-only">Back to tasks</span>
				</NuxtLink>
			</Button>

			<h1 class="text-3xl font-bold tracking-tight">Task Details</h1>
		</div>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			<div class="space-y-6 md:col-span-2">
				<Card>
					<CardHeader>
						<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
							<div>
								<CardTitle class="text-2xl">{{ task?.title }}</CardTitle>
							</div>
							<div class="flex flex-wrap gap-2">
								<Badge variant="outline" :class="['capitalize', getStatusColor(task?.status || 'todo')]">{{ task?.status.replace("_", " ") }}</Badge>
								<Badge variant="outline" :class="['capitalize', getPriorityColor(task?.priority || 'low')]">{{ task?.priority }} Priority </Badge>
							</div>
						</div>
					</CardHeader>

					<CardContent class="space-y-6">
						<div class="space-y-4">
							<div class="text-sm font-medium">Description</div>
							<div class="text-muted-foreground text-sm">
								<p>{{ task?.description }}</p>
							</div>
						</div>

						<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
							<div class="space-y-2">
								<div class="text-sm font-medium">Dates</div>
								<div class="space-y-2">
									<div class="flex items-center text-sm">
										<Icon name="hugeicons:calendar-02" :size="16" class="text-muted-foreground mr-2" />
										<span class="text-muted-foreground">Created on:</span>
										<span class="ml-2">{{ formatDate(task?.createdAt, "MMM D, YYYY") }}</span>
									</div>
									<div class="flex items-center text-sm">
										<Icon name="hugeicons:alarm-clock" :size="16" class="text-muted-foreground mr-2" />
										<span class="text-muted-foreground">Due date:</span>
										<span class="ml-2">{{ formatDate(task?.dueDate, "MMM D, YYYY") }}</span>
									</div>
								</div>
							</div>
							<div class="space-y-2">
								<div class="text-sm font-medium">Assigned to</div>
								<div v-if="task?.assignees && task?.assignees.length" class="flex flex-wrap items-start gap-x-4 gap-y-3">
									<div v-for="assignee in task?.assignees" :key="assignee.id" class="flex items-center gap-2">
										<Avatar class-name="h-8 w-8">
											<AvatarImage :src="assignee.profilePicture" alt="John Doe" />
											<AvatarFallback>{{ getInitials(assignee.firstName, assignee.lastName) }}</AvatarFallback>
										</Avatar>
										<div>
											<div class="text-sm font-medium">{{ assignee.firstName }} {{ assignee.lastName }}</div>
											<div class="text-muted-foreground text-xs">{{ assignee.username }}</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div class="space-y-2">
							<div class="text-sm font-medium">Attachments</div>
							<div class="flex items-center gap-2">
								<Button variant="outline" size="sm" class-name="h-8">
									<Icon name="hugeicons:attachment-01" :size="12" class="mr-2" />
									Add Attachment
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				<AppTaskComments />
			</div>

			<div class="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle class="text-lg">Activity</CardTitle>
					</CardHeader>

					<CardContent>
						<div class="h-[320px] space-y-4 overflow-y-auto">
							<div v-for="activity in activities" :key="activity.id" class="flex gap-3 text-sm">
								<Avatar class-name="h-6 w-6">
									<AvatarImage :src="activity.user.profilePicture" :alt="activity.user.username" />
									<AvatarFallback>{{ getInitials(activity.user.firstName, activity.user.lastName) }}</AvatarFallback>
								</Avatar>
								<div class="space-y-1">
									<p class="text-sm font-medium">{{ getLabel(activity) }}</p>
									<p class="text-muted-foreground text-sm" v-html="getDescription(activity)"></p>
									<p class="text-muted-foreground text-xs">{{ getTimeAgo(new Date(activity.createdAt)) }}</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle class="text-lg">Actions</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="space-y-2">
							<DropdownMenu v-for="action in taskActions" :key="action.value">
								<DropdownMenuTrigger as-child>
									<Button variant="outline" class="w-full justify-start" @click="selectedAction = action.value">{{ action.label }}</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent class="w-full max-w-[340px] p-3">
									<h6 class="text-sm font-bold text-gray-800">{{ taskActionsLabelMap[selectedAction].label }}</h6>
									<p class="mt-1 text-xs font-normal text-gray-600">{{ taskActionsLabelMap[selectedAction].description }}</p>

									<div>
										<RadioGroup v-if="['status', 'priority'].includes(selectedAction)" v-model="taskActionUpdate[selectedAction]">
											<div class="my-4 space-y-4">
												<div v-for="option in options" :key="option.value" class="flex items-start gap-2">
													<RadioGroupItem :id="option.value" :value="option.value" />
													<Label :html-for="option.value" class="flex flex-col items-start gap-1">
														<span class="font-semibold">{{ option.label }}</span>
														<span class="text-muted-foreground text-sm">{{ option.description }}</span>
													</Label>
												</div>
											</div>
										</RadioGroup>

										<div v-else-if="selectedAction === 'assignees'" class="my-4 space-y-4">
											<div v-for="member in teams" :key="member.id" class="items-top flex gap-x-2">
												<Checkbox :id="member.id" :model-value="taskActionUpdate.assignees.includes(member.id)" @update:model-value="addOrRemoveAssignee(member.id)" />
												<div class="grid gap-1.5 leading-none">
													<label :for="member.id" class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
														{{ member.firstName }} {{ member.lastName }}
													</label>
													<p class="text-muted-foreground text-sm">{{ member.username }}</p>
												</div>
											</div>
										</div>

										<div v-else-if="selectedAction === 'dueDate'" class="my-4 space-y-4">
											<AppCalendar v-model="taskActionUpdate.dueDate" class="rounded-md border" inline auto-apply />
										</div>

										<Button class="mt-3 w-full" :disabled="isUpdatingTask" @click="updateTaskProperties">Update</Button>
									</div>
								</DropdownMenuContent>
							</DropdownMenu>
							<Button variant="outline" class="w-full justify-start text-rose-500 hover:bg-rose-500/10 hover:text-rose-500" @click="isDeleteModalOpen = true"> Delete Task </Button>

							<AppDeleteAction
								v-model="isDeleteModalOpen"
								title="Delete task?"
								description="Are you sure you want to delete this task? This action cannot be undone."
								@cancel="isDeleteModalOpen = false"
								@confirm="deleteTask(task?.id || '', goToTasks)"
							/>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	</div>
</template>
