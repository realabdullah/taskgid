<script lang="ts" setup>
import { TaskAssignmentDialog } from "~/features/tasks";
import { useTeamMembers } from "~/features/teams/composables/useTeamMembers";
import TeamMemberDetails from "./TeamMemberDetails.vue";
import TeamMembersFilter from "./TeamMembersFilter.vue";

const {
	filter,
	getLastActive,
	isAssignTasksOpen,
	isMemberDetailsOpen,
	isMembersError,
	isMembersLoading,
	memberDetails,
	members,
	membersError,
	openMemberDetails,
	refetchMembers,
	removeMember,
	search,
	setMember,
} = useTeamMembers();
</script>

<template>
	<section class="space-y-5">
		<div class="flex flex-col justify-between gap-3 md:flex-row md:items-center">
			<div>
				<p class="text-text-primary text-2xl font-bold tracking-[-0.035em]">Roster</p>
				<p class="text-text-secondary mt-1 text-sm">Team directory with assignment and performance details.</p>
			</div>
			<div class="flex items-center gap-2">
				<div class="relative">
					<Icon name="hugeicons:search-01" :size="16" class="text-text-tertiary absolute start-2.5 top-2.5" />
					<Input v-model="search" type="search" placeholder="Search members…" class="h-9 w-full ps-8 sm:w-[240px]" />
				</div>
				<TeamMembersFilter v-model="filter" />
			</div>
		</div>

		<div v-if="isMembersLoading" class="space-y-2">
			<Skeleton class="h-10 w-full" />
			<Skeleton class="h-12 w-full" />
			<Skeleton class="h-12 w-full" />
		</div>

		<AppEmptyState
			v-else-if="isMembersError"
			heading="Unable to load team members"
			:body="getServerError(membersError, 'Check your connection and try again.')"
			icon="lucide:alert-circle"
			:action="{ label: 'Retry', onClick: () => refetchMembers(), variant: 'secondary' }"
		/>

		<div v-else-if="members && members.length" class="product-panel overflow-hidden">
			<div>
				<div
					class="text-text-tertiary bg-surface-1 hidden h-12 grid-cols-[minmax(240px,1.4fr)_120px_120px_120px_120px_56px] items-center border-b px-5 text-xs font-semibold tracking-widest uppercase md:grid"
				>
					<span>Member</span>
					<span>Assigned</span>
					<span>Completed</span>
					<span>Completion %</span>
					<span>Last active</span>
					<span class="text-end">Actions</span>
				</div>

				<div
					v-for="member in members"
					:key="member.id"
					class="border-border/70 hover:bg-accent-soft relative grid grid-cols-2 gap-x-5 gap-y-3 border-b px-4 py-4 text-sm last:border-b-0 md:h-16 md:grid-cols-[minmax(240px,1.4fr)_120px_120px_120px_120px_56px] md:items-center md:gap-0 md:px-5 md:py-0"
				>
					<Pressable class="col-span-2 flex min-w-0 items-center gap-3 pe-10 text-start md:col-span-1 md:pe-0" @click="openMemberDetails(member)">
						<Avatar class="h-8 w-8">
							<AvatarImage :src="member.profilePicture" :alt="member.firstName" />
							<AvatarFallback class="bg-accent-subtle text-accent-text">{{ getInitials(member.firstName, member.lastName) }}</AvatarFallback>
						</Avatar>
						<span class="min-w-0">
							<span class="text-text-primary block truncate font-medium">{{ member.firstName }} {{ member.lastName }}</span>
							<span class="text-text-tertiary block truncate text-xs">{{ member.title || "Member" }}</span>
						</span>
					</Pressable>

					<span class="text-text-secondary flex items-center justify-between gap-3 tabular-nums md:block"
						><span class="text-text-tertiary text-xs md:hidden">Assigned</span>{{ member.taskStats.assigned }}</span
					>
					<span class="text-text-secondary flex items-center justify-between gap-3 tabular-nums md:block"
						><span class="text-text-tertiary text-xs md:hidden">Completed</span>{{ member.taskStats.completed }}</span
					>
					<span class="text-text-secondary flex items-center justify-between gap-3 tabular-nums md:block"
						><span class="text-text-tertiary text-xs md:hidden">Completion</span>
						{{ member.taskStats.assigned ? Math.round((member.taskStats.completed / member.taskStats.assigned) * 100) : 0 }}%</span
					>
					<span class="text-text-tertiary flex items-center justify-between gap-3 tabular-nums md:block"
						><span class="text-text-tertiary text-xs md:hidden">Last active</span>{{ getLastActive(member) }}</span
					>

					<div class="absolute end-3 top-3 flex justify-end md:static">
						<DropdownMenu>
							<DropdownMenuTrigger as-child>
								<Button variant="ghost" size="icon" class="h-8 w-8" aria-label="Member actions">
									<Icon name="lucide:ellipsis" :size="16" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" class="border-border bg-surface-0 border">
								<DropdownMenuItem @select="setMember(member, 'view-details')">View details</DropdownMenuItem>
								<DropdownMenuItem @select="setMember(member, 'assign-task')">Assign tasks</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem variant="destructive" @select="removeMember">Remove member</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>
		</div>

		<AppEmptyState v-else heading="No matching team members" body="Clear your filters or invite someone to this workspace." icon="lucide:users" />

		<template v-if="memberDetails">
			<TeamMemberDetails v-model="isMemberDetailsOpen" :member="memberDetails" />
			<TaskAssignmentDialog v-model="isAssignTasksOpen" :member="memberDetails">
				<span />
			</TaskAssignmentDialog>
		</template>
	</section>
</template>
