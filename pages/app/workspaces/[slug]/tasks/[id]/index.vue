<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import type { ActivityDetails, Task } from "~/types";

definePageMeta({ name: "task-id", layout: "workspace" });

const { getLabel, getDescription } = useActivityLabel();
const route = useRoute();

const { data: task } = useQuery({
	queryKey: ["task", route.params.id],
	queryFn: async () => {
		const { success, data } = await useApiFetch<{ success: boolean; data: Task }>(`/workspaces/${useRoute().params.slug}/tasks/${route.params.id}`);
		if (!data || !success) throw new Error("Failed to fetch task");
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
								<Badge variant="outline" :class="['capitalize', getStatusColor(task?.status || 'todo')]">{{ task?.status }}</Badge>
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
							<Button variant="outline" class="w-full justify-start"> Change Status </Button>
							<Button variant="outline" class="w-full justify-start"> Change Priority </Button>
							<Button variant="outline" class="w-full justify-start"> Assign to Someone Else </Button>
							<Button variant="outline" class="w-full justify-start"> Set Due Date </Button>
							<Button variant="outline" class="w-full justify-start text-rose-500 hover:bg-rose-500/10 hover:text-rose-500"> Delete Task </Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	</div>
</template>
