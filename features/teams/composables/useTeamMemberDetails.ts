import { useQuery } from "@tanstack/vue-query";
import type { ActivityDetails, PaginatedResponse, TeamMember, UserBareTask } from "~/types";

export const useTeamMemberDetails = (member: MaybeRefOrGetter<TeamMember>, isOpen: MaybeRefOrGetter<boolean | undefined>) => {
	const route = useRoute();
	const currentMember = computed(() => toValue(member));
	const workspaceSlug = computed(() => String(route.params.slug || ""));

	const tasksQuery = useQuery({
		queryKey: computed(() => ["user-tasks", currentMember.value.id]),
		queryFn: async () => {
			const { success, data } = await useApiFetch<PaginatedResponse<UserBareTask>>(API_ENDPOINTS.workspaces.memberTasks(workspaceSlug.value, currentMember.value.id), {
				query: { page: 1, limit: LIST_PAGE_SIZE },
			});
			if (!data || !success) throw new Error("Unable to load assigned tasks. Try again.");
			return data;
		},
		enabled: computed(() => Boolean(currentMember.value && toValue(isOpen))),
	});

	const activitiesQuery = useQuery({
		queryKey: computed(() => ["user-activities", currentMember.value.id]),
		queryFn: async () => {
			const { success, data } = await useApiFetch<PaginatedResponse<ActivityDetails>>(API_ENDPOINTS.workspaces.memberActivities(workspaceSlug.value, currentMember.value.id), {
				query: { page: 1, limit: LIST_PAGE_SIZE },
			});
			if (!data || !success) throw new Error("Unable to load recent activity. Try again.");
			return data;
		},
		enabled: computed(() => Boolean(currentMember.value && toValue(isOpen))),
	});

	const completionRate = computed(() => {
		const stats = currentMember.value.taskStats;
		return stats.assigned ? Math.round((stats.completed / stats.assigned) * 100) : 0;
	});

	const viewAllTasks = () => navigateTo(`/app/workspaces/${workspaceSlug.value}/tasks`);

	return { tasksQuery, activitiesQuery, completionRate, viewAllTasks };
};
