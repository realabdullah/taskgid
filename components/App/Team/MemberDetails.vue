<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import type { UserBareTask, TeamMember, ActivityDetails } from "~/types";

const isOpen = defineModel<boolean>();
const { member } = defineProps<{ member: TeamMember }>();
const route = useRoute();
const { getLabel, getDescription } = useActivityLabel();

const { data: tasks } = useQuery({
	queryKey: ["user-tasks", member.id],
	queryFn: async () => {
		const { success, data } = await useApiFetch<{ success: boolean; data: UserBareTask[] }>(`/workspaces/${route.params.slug}/members/${member.id}/tasks`);
		if (!data || !success) return [];
		return data;
	},
	enabled: () => !!member && isOpen.value,
});

const { data: activities } = useQuery({
	queryKey: ["user-activities", member.id],
	queryFn: async () => {
		const { success, data } = await useApiFetch<{ success: boolean; data: ActivityDetails[] }>(`/workspaces/${route.params.slug}/members/${member.id}/activities`);
		if (!data || !success) return [];
		return data;
	},
	enabled: () => !!member && isOpen.value,
});
</script>

<template>
	<Dialog v-model:open="isOpen">
		<DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
			<DialogHeader>
				<DialogTitle>Team Member Details</DialogTitle>
				<DialogDescription>View and manage team member information</DialogDescription>
			</DialogHeader>

			<div class="flex flex-col items-center pt-4 text-center">
				<div class="relative">
					<Avatar class="h-20 w-20">
						<AvatarImage :src="member.profilePicture" :alt="member.firstName" />
						<AvatarFallback>{{ getInitials(member.firstName, member.lastName) }}</AvatarFallback>
					</Avatar>
				</div>
				<h2 class="mt-4 text-xl font-semibold">{{ member.firstName }} {{ member.lastName }}</h2>
				<p class="text-muted-foreground text-sm">{{ member.title }}</p>
				<div class="mt-1 flex items-center gap-2">
					<Badge variant="outline" class="capitalize">{{ member.role }}</Badge>
				</div>
			</div>

			<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="flex items-center gap-2">
					<Icon name="hugeicons:mail-02" :size="16" class="text-muted-foreground" />
					<span class="text-sm">{{ member.email }}</span>
				</div>
				<div class="flex items-center gap-2">
					<Icon name="hugeicons:location-03" :size="16" class="text-muted-foreground" />
					<span class="text-sm">{{ member.location }}</span>
				</div>
				<div class="flex items-center gap-2">
					<Icon name="hugeicons:calendar-03" :size="16" class="text-muted-foreground" />
					<span class="text-sm">Joined {{ formatDate(member.dateJoined, "DD/MM/YYYY") }}</span>
				</div>
				<div class="flex items-center gap-2">
					<Icon name="hugeicons:checkmark-square-03" :size="16" class="text-muted-foreground" />
					<span class="text-sm"> {{ member.taskStats.completed }} of {{ member.taskStats.assigned }} tasks completed </span>
				</div>
			</div>

			<Tabs default-value="tasks" class="mt-6">
				<TabsList class="grid w-full grid-cols-2">
					<TabsTrigger value="tasks">Tasks</TabsTrigger>
					<TabsTrigger value="activity">Recent Activity</TabsTrigger>
				</TabsList>
				<TabsContent value="tasks" class="mt-4 space-y-4">
					<template v-if="tasks && tasks.length">
						<Card v-for="task in tasks" :key="task.id">
							<CardContent class="p-4">
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-2">
										<Icon :name="getStatusIcon(task.status).icon" :class="getStatusIcon(task.status).class" />
										<span class="font-medium">{{ task.title }}</span>
									</div>
									<Badge variant="outline" :class="getPriorityColor(task.priority)"> {{ task.priority }} </Badge>
								</div>
								<div class="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
									<Icon name="hugeicons:calendar-03" :size="16" />
									<span>Due {{ formatDate(task.dueDate, "Do, MMM YYYY") }}</span>
								</div>
							</CardContent>
						</Card>
					</template>

					<div v-else class="py-8 text-center">
						<p class="text-muted-foreground">No tasks assigned</p>
					</div>
					<Button variant="outline" class="w-full" @click="navigateTo({ name: 'tasks' })"> View All Tasks </Button>
				</TabsContent>

				<TabsContent value="activity" class="mt-4 space-y-4">
					<template v-if="activities && activities.length">
						<div v-for="activity in activities" :key="activity.id" class="flex items-start gap-3 py-2">
							<div class="bg-primary mt-2 h-2 w-2 rounded-full" />
							<div class="space-y-1">
								<p class="text-sm font-medium">{{ getLabel(activity) }}</p>
								<p class="text-muted-foreground text-sm" v-html="getDescription(activity)"></p>
								<p class="text-muted-foreground text-xs">{{ getTimeAgo(new Date(activity.createdAt)) }}</p>
							</div>
						</div>
					</template>

					<div v-else class="py-8 text-center">
						<p class="text-muted-foreground">No recent activity</p>
					</div>
					<Button variant="outline" class="w-full"> View All Activity </Button>
				</TabsContent>
			</Tabs>

			<div class="mt-6 flex justify-between">
				<Button variant="outline" @click="isOpen = false"> Close </Button>
				<div class="flex gap-2">
					<Button variant="outline">Assign Task</Button>
					<Button>Edit Profile</Button>
				</div>
			</div>
		</DialogContent>
	</Dialog>
</template>
