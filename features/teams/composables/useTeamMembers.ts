import { useQuery } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import type { TeamMember } from "~/types";

export const useTeamMembers = () => {
	const route = useRoute();
	const search = shallowRef("");
	const filter = shallowReactive<Record<string, string | number>>({});
	const isFilterActive = computed(() => Object.values(filter).some(Boolean));
	const isAssignTasksOpen = ref(false);
	const isMemberDetailsOpen = ref(false);
	const memberDetails = ref<TeamMember>();

	const {
		data: members,
		isPending: isMembersLoading,
		isError: isMembersError,
		error: membersError,
		refetch: refetchMembers,
	} = useQuery({
		queryKey: ["members-list", route.params.slug, filter, search],
		queryFn: async () => {
			const { data } = await fetchAllPages<TeamMember>(API_ENDPOINTS.workspaces.teamComprehensive(String(route.params.slug)), {
				query: { ...(isFilterActive.value ? filter : undefined), search: search.value },
			});
			return data;
		},
	});

	const setMember = (member: TeamMember, context: "view-details" | "assign-task") => {
		memberDetails.value = { ...member };
		if (context === "view-details") isMemberDetailsOpen.value = true;
		else isAssignTasksOpen.value = true;
	};
	const openMemberDetails = (member: TeamMember) => setMember(member, "view-details");
	const getLastActive = (member: TeamMember & { lastActiveAt?: string; updatedAt?: string }) => {
		const value = member.lastActiveAt || member.updatedAt || member.dateJoined;
		return value ? useRelativeTime(value) : "Unknown";
	};
	const removeMember = () => toast.info("Remove member action is not available yet.");

	return {
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
	};
};
