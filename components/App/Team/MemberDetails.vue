<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import type { ActivityDetails, TeamMember, UserBareTask } from "~/types";

const isOpen = defineModel<boolean>();
const { member } = defineProps<{ member: TeamMember }>();
const route = useRoute();
const { getLabel, getDescription } = useActivityLabel();
const isAssignTasksOpen = ref(false);

const {
	data: tasks,
	isPending: isTasksLoading,
	isError: isTasksError,
	error: tasksError,
	refetch: refetchTasks,
} = useQuery({
	queryKey: ["user-tasks", member.id],
	queryFn: async () => {
		const { success, data } = await useApiFetch<{ success: boolean; data: UserBareTask[] }>(API_ENDPOINTS.workspaces.memberTasks(route.params.slug, member.id));
		if (!data || !success) throw new Error("Failed to fetch member tasks");
		return data;
	},
	enabled: () => !!member && isOpen.value,
});

const {
	data: activities,
	isPending: isActivitiesLoading,
	isError: isActivitiesError,
	error: activitiesError,
	refetch: refetchActivities,
} = useQuery({
	queryKey: ["user-activities", member.id],
	queryFn: async () => {
		const { success, data } = await useApiFetch<{ success: boolean; data: ActivityDetails[] }>(API_ENDPOINTS.workspaces.memberActivities(route.params.slug, member.id));
		if (!data || !success) throw new Error("Failed to fetch member activity");
		return data;
	},
	enabled: () => !!member && isOpen.value,
});

const completionRate = computed(() => {
	if (!member.taskStats.assigned) return 0;
	return Math.round((member.taskStats.completed / member.taskStats.assigned) * 100);
});

const closeSheet = () => {
	isOpen.value = false;
};

const viewAllTasks = () => {
	navigateTo(`/app/workspaces/${route.params.slug}/tasks`);
};
</script>

<template>
	<Sheet :open="isOpen" @update:open="(value) => (isOpen = value)">
		<SheetContent side="right" class="border-border bg-surface-0 w-full border-l p-0 sm:max-w-[420px]">
			<div class="flex h-full flex-col overflow-hidden">
				<header class="border-border border-b px-5 py-4">
					<div class="flex items-start justify-between gap-3">
						<div class="flex items-center gap-3">
							<Avatar class="h-10 w-10">
								<AvatarImage :src="member.profilePicture" :alt="member.firstName" />
								<AvatarFallback class="bg-accent-subtle text-accent-text">{{ getInitials(member.firstName, member.lastName) }}</AvatarFallback>
							</Avatar>
							<div>
								<p class="text-text-primary text-sm font-semibold">{{ member.firstName }} {{ member.lastName }}</p>
								<p class="text-text-tertiary text-xs">{{ member.title || "Team member" }}</p>
							</div>
						</div>
						<Badge variant="outline" class="capitalize">{{ member.role }}</Badge>
					</div>
				</header>

				<div class="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
					<div class="grid grid-cols-3 gap-2">
						<div class="border-border bg-surface-1 rounded-md border p-2">
							<p class="text-2xs text-text-tertiary">Assigned</p>
							<p class="text-text-primary mt-1 text-sm font-semibold">{{ member.taskStats.assigned }}</p>
						</div>
						<div class="border-border bg-surface-1 rounded-md border p-2">
							<p class="text-2xs text-text-tertiary">Completed</p>
							<p class="text-text-primary mt-1 text-sm font-semibold">{{ member.taskStats.completed }}</p>
						</div>
						<div class="border-border bg-surface-1 rounded-md border p-2">
							<p class="text-2xs text-text-tertiary">Completion</p>
							<p class="text-text-primary mt-1 text-sm font-semibold">{{ completionRate }}%</p>
						</div>
					</div>

					<div class="text-text-secondary space-y-1 text-sm">
						<p>{{ member.email }}</p>
						<p v-if="member.location">{{ member.location }}</p>
						<p>Joined {{ formatDate(member.dateJoined, "MMM D, YYYY") }}</p>
					</div>

					<section class="space-y-2">
						<p class="text-2xs text-text-tertiary font-semibold tracking-widest uppercase">Tasks</p>
						<div v-if="isTasksLoading" class="space-y-2">
							<Skeleton class="h-16 w-full" />
							<Skeleton class="h-16 w-full" />
						</div>
						<AppEmptyState
							v-else-if="isTasksError"
							heading="Could not load member tasks"
							:body="String(tasksError || 'Try again in a moment.')"
							icon="lucide:alert-circle"
							:action="{ label: 'Retry', onClick: () => refetchTasks(), variant: 'secondary' }"
						/>
						<div v-else-if="tasks?.length" class="space-y-2">
							<div v-for="task in tasks" :key="task.id" class="border-border bg-surface-1 rounded-md border p-3">
								<div class="flex items-start justify-between gap-2">
									<p class="text-text-primary line-clamp-2 text-sm font-medium">{{ task.title }}</p>
									<BadgePriority :priority="task.priority" />
								</div>
								<div class="text-2xs text-text-tertiary mt-2 flex items-center justify-between">
									<BadgeStatus :status="task.status" />
									<span>{{ task.dueDate ? `Due ${formatDate(task.dueDate, "MMM D")}` : "No due date" }}</span>
								</div>
							</div>
						</div>
						<p v-else class="text-text-tertiary text-sm">No tasks assigned.</p>
					</section>

					<section class="space-y-2">
						<p class="text-2xs text-text-tertiary font-semibold tracking-widest uppercase">Recent activity</p>
						<div v-if="isActivitiesLoading" class="space-y-2">
							<Skeleton class="h-16 w-full" />
							<Skeleton class="h-16 w-full" />
						</div>
						<AppEmptyState
							v-else-if="isActivitiesError"
							heading="Could not load activity"
							:body="String(activitiesError || 'Please retry.')"
							icon="lucide:alert-circle"
							:action="{ label: 'Retry', onClick: () => refetchActivities(), variant: 'secondary' }"
						/>
						<div v-else-if="activities?.length" class="space-y-2">
							<div v-for="activity in activities" :key="activity.id" class="border-border bg-surface-1 rounded-md border p-3">
								<p class="text-text-primary text-sm font-medium">{{ getLabel(activity) }}</p>
								<p class="text-text-secondary mt-1 text-sm" v-html="getDescription(activity)"></p>
								<p class="text-2xs text-text-tertiary mt-1">{{ getTimeAgo(new Date(activity.createdAt)) }}</p>
							</div>
						</div>
						<p v-else class="text-text-tertiary text-sm">No recent activity.</p>
					</section>
				</div>

				<footer class="border-border flex items-center gap-2 border-t px-5 py-3">
					<Button variant="secondary" class="flex-1" @click="viewAllTasks">View all tasks</Button>
					<AppTaskAssign v-model="isAssignTasksOpen" :member="member">
						<Button class="flex-1">Manage assignments</Button>
					</AppTaskAssign>
					<Button variant="ghost" size="icon" aria-label="Close" @click="closeSheet">
						<Icon name="lucide:x" :size="16" />
					</Button>
				</footer>
			</div>
		</SheetContent>
	</Sheet>
</template>
