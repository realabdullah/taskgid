<script lang="ts" setup>
import type { TeamMember } from "~/types";
import { useActivityLabel } from "~/features/activity/composables/useActivityLabel";
import { TaskAssignmentDialog } from "~/features/tasks";
import { useTeamMemberDetails } from "../composables/useTeamMemberDetails";

const isOpen = defineModel<boolean>();
const { member } = defineProps<{ member: TeamMember }>();
const { getLabel, getDescription } = useActivityLabel();
const isAssignTasksOpen = ref(false);
const { tasksQuery, activitiesQuery, completionRate, viewAllTasks } = useTeamMemberDetails(() => member, isOpen);
const { data: tasks, isPending: isTasksLoading, isError: isTasksError, error: tasksError, refetch: refetchTasks } = tasksQuery;
const { data: activities, isPending: isActivitiesLoading, isError: isActivitiesError, error: activitiesError, refetch: refetchActivities } = activitiesQuery;
</script>

<template>
	<Sheet :open="isOpen" @update:open="(value) => (isOpen = value)">
		<SheetContent side="right" class="border-border bg-surface-0 w-full border-s p-0 sm:max-w-[560px]">
			<div class="flex h-full flex-col overflow-hidden">
				<!-- `pe-14` keeps the header clear of the sheet's own close button. -->
				<header class="border-border bg-surface-1 border-b px-6 py-6 pe-14">
					<div class="flex items-center gap-3">
						<Avatar class="h-10 w-10">
							<AvatarImage :src="member.profilePicture" :alt="member.firstName" />
							<AvatarFallback class="bg-accent-subtle text-accent-text">{{ getInitials(member.firstName, member.lastName) }}</AvatarFallback>
						</Avatar>
						<div class="min-w-0">
							<p class="truncate text-lg font-bold">{{ member.firstName }} {{ member.lastName }}</p>
							<div class="mt-1 flex flex-wrap items-center gap-2">
								<Badge variant="outline" class="capitalize">{{ member.role }}</Badge>
								<span class="text-text-tertiary truncate text-xs">{{ member.title || "Team member" }}</span>
							</div>
						</div>
					</div>
				</header>

				<div class="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
					<div class="divide-border border-border grid grid-cols-3 divide-x overflow-hidden rounded-md border">
						<div class="px-3 py-3">
							<p class="text-text-tertiary text-xs">Assigned</p>
							<p class="text-text-primary mt-1 text-sm font-semibold tabular-nums">{{ member.taskStats.assigned }}</p>
						</div>
						<div class="px-3 py-3">
							<p class="text-text-tertiary text-xs">Completed</p>
							<p class="text-text-primary mt-1 text-sm font-semibold tabular-nums">{{ member.taskStats.completed }}</p>
						</div>
						<div class="px-3 py-3">
							<p class="text-text-tertiary text-xs">Completion</p>
							<p class="text-text-primary mt-1 text-sm font-semibold tabular-nums">{{ completionRate }}%</p>
						</div>
					</div>

					<div class="text-text-secondary space-y-1 text-sm">
						<p>{{ member.email }}</p>
						<p v-if="member.location">{{ member.location }}</p>
						<p>Joined {{ formatDate(member.dateJoined, "MMM D, YYYY") }}</p>
					</div>

					<section class="space-y-2">
						<p class="text-text-tertiary text-xs font-semibold tracking-widest uppercase">Tasks</p>
						<div v-if="isTasksLoading" class="space-y-2">
							<Skeleton class="h-16 w-full" />
							<Skeleton class="h-16 w-full" />
						</div>
						<AppEmptyState
							v-else-if="isTasksError"
							heading="Unable to load assigned tasks"
							:body="getServerError(tasksError, 'Check your connection and try again.')"
							icon="lucide:alert-circle"
							:action="{ label: 'Retry', onClick: () => refetchTasks(), variant: 'secondary' }"
						/>
						<div v-else-if="tasks?.length" class="space-y-2">
							<div v-for="task in tasks" :key="task.id" class="border-border bg-surface-1 rounded-md border p-3">
								<div class="flex items-start justify-between gap-2">
									<p class="text-text-primary line-clamp-2 text-sm font-medium">{{ task.title }}</p>
									<BadgePriority :priority="task.priority" />
								</div>
								<div class="text-text-tertiary mt-2 flex items-center justify-between text-xs tabular-nums">
									<BadgeStatus :status="task.status" />
									<span>{{ task.dueDate ? `Due ${formatDate(task.dueDate, "MMM D")}` : "No due date" }}</span>
								</div>
							</div>
						</div>
						<p v-else class="text-text-tertiary text-sm">No tasks assigned.</p>
					</section>

					<section class="space-y-2">
						<p class="text-text-tertiary text-xs font-semibold tracking-widest uppercase">Recent activity</p>
						<div v-if="isActivitiesLoading" class="space-y-2">
							<Skeleton class="h-16 w-full" />
							<Skeleton class="h-16 w-full" />
						</div>
						<AppEmptyState
							v-else-if="isActivitiesError"
							heading="Unable to load recent activity"
							:body="getServerError(activitiesError, 'Check your connection and try again.')"
							icon="lucide:alert-circle"
							:action="{ label: 'Retry', onClick: () => refetchActivities(), variant: 'secondary' }"
						/>
						<div v-else-if="activities?.length" class="space-y-2">
							<div v-for="activity in activities" :key="activity.id" class="border-border bg-surface-1 rounded-md border p-3">
								<p class="text-text-primary text-sm font-medium">{{ getLabel(activity) }}</p>
								<p class="text-text-secondary mt-1 text-sm" v-html="getDescription(activity)"></p>
								<p class="text-text-tertiary mt-1 text-xs tabular-nums">{{ getTimeAgo(new Date(activity.createdAt)) }}</p>
							</div>
						</div>
						<p v-else class="text-text-tertiary text-sm">No recent activity.</p>
					</section>
				</div>

				<footer class="border-border flex items-center gap-2 border-t px-5 py-3">
					<Button variant="secondary" class="flex-1" @click="viewAllTasks">View all tasks</Button>
					<TaskAssignmentDialog v-model="isAssignTasksOpen" :member="member">
						<Button class="flex-1">Manage assignments</Button>
					</TaskAssignmentDialog>
				</footer>
			</div>
		</SheetContent>
	</Sheet>
</template>
