<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import type { Pagination, TeamMember } from "~/types";

const route = useRoute();

const search = shallowRef("");
const filter = shallowReactive<{ [key: string]: string | number }>({});
const isFilterActive = computed(() => Object.entries(filter).some(([, val]) => !!val));

const {
	data: members,
	isPending: isMembersLoading,
	isError: isMembersError,
	error: membersError,
	refetch: refetchMembers,
} = useQuery({
	queryKey: ["members-list", route.params.slug, filter, search],
	queryFn: async () => {
		const url = `/workspaces/${route.params.slug}/team/comprehensive`;
		const queryParams = isFilterActive.value ? filter : undefined;
		const { success, data, message } = await useApiFetch<{ success: boolean; data: TeamMember[]; pagination: Pagination; message?: string }>(url, {
			method: "GET",
			query: { ...queryParams, search: search.value },
		});
		if (!data || !success)
			throw createError({
				status: 500,
				statusMessage: message || "Failed to fetch workspace team members",
			});
		return data;
	},
});

const isAssignTasksOpen = ref(false);
const isMemberDetailsOpen = ref(false);
const memberDetails = ref<TeamMember>();

const setMember = (member: TeamMember, context: "view-details" | "assign-task") => {
	memberDetails.value = { ...member };
	if (context === "view-details") isMemberDetailsOpen.value = true;
	else if (context === "assign-task") isAssignTasksOpen.value = true;
};

const openMemberDetails = (member: TeamMember) => {
	setMember(member, "view-details");
};

const getLastActive = (member: TeamMember & { lastActiveAt?: string; updatedAt?: string }) => {
	const value = member.lastActiveAt || member.updatedAt || member.dateJoined;
	if (!value) return "Unknown";
	return useRelativeTime(value);
};

const removeMember = async () => {
	toast.info("Remove member action is not available yet.");
};

// watch([isAssignTasksOpen, isMemberDetailsOpen], () => {
// 	if (!isAssignTasksOpen.value || !isMemberDetailsOpen.value) {
// 		memberDetails.value = undefined;
// 	}
// });
</script>

<template>
	<section class="border-border bg-surface-0 space-y-4 rounded-lg border p-4">
		<div class="flex flex-col justify-between gap-3 md:flex-row md:items-center">
			<div>
				<p class="text-text-primary text-sm font-semibold">Members</p>
				<p class="text-text-tertiary text-xs">Team directory with assignment and performance details.</p>
			</div>
			<div class="flex items-center gap-2">
				<div class="relative">
					<Icon name="hugeicons:search-01" :size="16" class="text-text-tertiary absolute top-2.5 left-2.5" />
					<Input v-model="search" type="search" placeholder="Search members..." class="h-9 w-full pl-8 sm:w-[240px]" />
				</div>
				<AppTeamMembersListFilter v-model="filter" />
			</div>
		</div>

		<div v-if="isMembersLoading" class="space-y-2">
			<Skeleton class="h-10 w-full" />
			<Skeleton class="h-12 w-full" />
			<Skeleton class="h-12 w-full" />
		</div>

		<AppEmptyState
			v-else-if="isMembersError"
			heading="Could not load team members"
			:body="String(membersError || 'Please try again.')"
			icon="lucide:alert-circle"
			:action="{ label: 'Retry', onClick: () => refetchMembers(), variant: 'secondary' }"
		/>

		<div v-else-if="members && members.length" class="overflow-x-auto">
			<div class="min-w-[760px]">
				<div
					class="border-border text-2xs text-text-tertiary grid h-10 grid-cols-[minmax(240px,1.4fr)_120px_120px_120px_120px_56px] items-center border-b px-3 font-semibold tracking-widest uppercase"
				>
					<span>Member</span>
					<span>Assigned</span>
					<span>Completed</span>
					<span>Completion %</span>
					<span>Last active</span>
					<span class="text-right">Actions</span>
				</div>

				<div
					v-for="member in members"
					:key="member.id"
					class="border-border/70 hover:bg-surface-2/40 grid h-12 grid-cols-[minmax(240px,1.4fr)_120px_120px_120px_120px_56px] items-center border-b px-3 text-sm last:border-b-0"
				>
					<button type="button" class="flex items-center gap-3 text-left" @click="openMemberDetails(member)">
						<Avatar class="h-8 w-8">
							<AvatarImage :src="member.profilePicture" :alt="member.firstName" />
							<AvatarFallback class="bg-accent-subtle text-accent-text">{{ getInitials(member.firstName, member.lastName) }}</AvatarFallback>
						</Avatar>
						<span class="min-w-0">
							<span class="text-text-primary block truncate font-medium">{{ member.firstName }} {{ member.lastName }}</span>
							<span class="text-2xs text-text-tertiary block truncate">{{ member.title || "Member" }}</span>
						</span>
					</button>

					<span class="text-text-secondary">{{ member.taskStats.assigned }}</span>
					<span class="text-text-secondary">{{ member.taskStats.completed }}</span>
					<span class="text-text-secondary"> {{ member.taskStats.assigned ? Math.round((member.taskStats.completed / member.taskStats.assigned) * 100) : 0 }}% </span>
					<span class="text-text-tertiary">{{ getLastActive(member) }}</span>

					<div class="flex justify-end">
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
								<DropdownMenuItem class="text-danger" @select="removeMember">Remove member</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>
		</div>

		<AppEmptyState v-else heading="No team members found" body="Try refining filters or invite teammates to this workspace." icon="lucide:users" />

		<template v-if="memberDetails">
			<AppTeamMemberDetails v-model="isMemberDetailsOpen" :member="memberDetails" />
			<AppTaskAssign v-model="isAssignTasksOpen" :member="memberDetails">
				<span />
			</AppTaskAssign>
		</template>
	</section>
</template>
