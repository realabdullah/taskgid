<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import type { Pagination, TeamMember } from "~/types";

const route = useRoute();
const { user } = storeToRefs(useStore());
const { workspace } = storeToRefs(useWorkspaceStore());

const search = shallowRef("");
const filter = shallowReactive<{ [key: string]: string | number }>({});
const isFilterActive = computed(() => Object.entries(filter).some(([, val]) => !!val));

const { data: members } = useQuery({
	queryKey: ["members-list", route.params.id, filter, search],
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

const isMemberDetailsOpen = ref(false);
const memberDetails = ref<TeamMember>();

const setMember = (member: TeamMember) => {
	memberDetails.value = { ...member };
	isMemberDetailsOpen.value = true;
};
</script>

<template>
	<div>
		<Card>
			<CardHeader class="flex flex-col justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0">
				<div>
					<CardTitle>Team Members</CardTitle>
					<CardDescription>Manage team members and their roles</CardDescription>
				</div>
				<div class="flex items-center gap-2">
					<div class="relative">
						<Icon name="hugeicons:search-01" :size="16" class="text-muted-foreground absolute top-2.5 left-2.5" />
						<Input v-model="search" type="search" placeholder="Search members..." class="w-full pl-8 sm:w-[200px]" />
					</div>
					<AppTeamMembersListFilter v-model="filter" />
					<!-- <Button variant="outline" size="icon">
						<Icon name="hugeicons:filter" :size="16" />
						<span class="sr-only">Filter</span>
					</Button> -->
				</div>
			</CardHeader>
			<CardContent>
				<div v-if="members && members.length" class="space-y-4">
					<div
						v-for="member in members"
						:key="member.id"
						class="hover:bg-accent/5 flex flex-col justify-between space-y-4 rounded-lg border p-4 transition-colors sm:flex-row sm:items-center sm:space-y-0"
					>
						<div class="flex items-center space-x-4">
							<div class="relative">
								<Avatar class="h-10 w-10">
									<AvatarImage :src="member.profilePicture" :alt="member.firstName" />
									<AvatarFallback>{{ getInitials(member.firstName, member.lastName) }}</AvatarFallback>
								</Avatar>
							</div>
							<div>
								<div class="font-medium">{{ member.firstName }} {{ member.lastName }}</div>
								<div class="text-muted-foreground text-sm">{{ member.title }}</div>
							</div>
						</div>
						<div class="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
							<div class="text-muted-foreground hidden items-center gap-1 text-sm md:flex">
								<Icon name="hugeicons:mail-02" :size="16" />
								<span>{{ member.email }}</span>
							</div>
							<div class="text-muted-foreground hidden items-center gap-1 text-sm lg:flex">
								<Icon name="hugeicons:calendar-03" :size="16" />
								<span>Joined {{ formatDate(member.dateJoined, "DD/MM/YYYY") }}</span>
							</div>
							<div class="flex items-center gap-1 text-sm">
								<Icon name="hugeicons:checkmark-square-03" :size="16" class="text-muted-foreground" />
								<span> {{ member.taskStats.completed }}/{{ member.taskStats.assigned }} tasks </span>
							</div>
							<div class="flex items-center gap-2">
								<Badge v-if="member.role === 'creator'" variant="outline" class="text-xs"> Creator </Badge>

								<DropdownMenu>
									<DropdownMenuTrigger as-child>
										<Button variant="ghost" size="icon" class="h-8 w-8">
											<Icon name="hugeicons:more-horizontal-square-01" :size="16" />
											<span class="sr-only">More options</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuLabel>Actions</DropdownMenuLabel>
										<DropdownMenuItem @click="setMember(member)">View Profile</DropdownMenuItem>
										<DropdownMenuItem>Assign Tasks</DropdownMenuItem>

										<template v-if="['admin', 'creator'].includes(workspace?.userRole || '') && user?.id !== member?.id">
											<DropdownMenuSeparator />

											<DropdownMenuItem v-if="member.role === 'member'">Make Admin</DropdownMenuItem>
											<DropdownMenuItem v-else-if="member.role !== 'creator'">Remove Admin</DropdownMenuItem>

											<DropdownMenuItem class="text-rose-500">Remove Member</DropdownMenuItem>
										</template>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>
					</div>

					<AppTeamMemberDetails v-if="memberDetails" v-model="isMemberDetailsOpen" :member="memberDetails" />
				</div>

				<div v-else class="py-10 text-center">
					<p class="text-muted-foreground">No team members found</p>
				</div>
			</CardContent>
		</Card>
	</div>
</template>
