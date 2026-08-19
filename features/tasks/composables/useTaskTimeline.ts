import { useQuery } from "@tanstack/vue-query";
import type { ActivityDetails, Comment, PaginatedResponse } from "~/types";

type TaskTimelineOptions = { workspaceSlug: string; taskId: string };

export const useTaskTimeline = (options: TaskTimelineOptions) => {
	const activeStream = ref<"comments" | "history">("comments");

	const {
		data: activities,
		isFetching: isActivitiesLoading,
		isError: isActivitiesError,
		error: activitiesError,
		refetch: refetchActivities,
	} = useQuery({
		queryKey: computed(() => ["task-activities", options.workspaceSlug, options.taskId]),
		queryFn: async () => {
			const { success, data } = await useApiFetch<PaginatedResponse<ActivityDetails>>(API_ENDPOINTS.workspaces.taskActivities(options.workspaceSlug, options.taskId), {
				query: { page: 1, limit: LIST_PAGE_SIZE },
			});
			if (!success || !data) throw new Error("Unable to load task activity. Try again.");
			return data;
		},
		enabled: computed(() => Boolean(options.workspaceSlug && options.taskId)),
	});

	const {
		data: commentsResponse,
		isFetching: isCommentsLoading,
		isError: isCommentsError,
		error: commentsError,
		refetch: refetchComments,
	} = useQuery({
		queryKey: computed(() => ["task-comments", options.workspaceSlug, options.taskId]),
		queryFn: async () => {
			const { success, data, pagination } = await useApiFetch<PaginatedResponse<Comment>>(API_ENDPOINTS.workspaces.taskComments(options.workspaceSlug, options.taskId), {
				query: { page: 1, limit: LIST_PAGE_SIZE },
			});
			if (!success || !data) throw new Error("Unable to load task comments. Try again.");
			return { comments: data, pagination };
		},
		enabled: computed(() => Boolean(options.workspaceSlug && options.taskId)),
	});

	const sortedActivities = computed(() => [...(activities.value ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
	const sortedComments = computed(() => [...(commentsResponse.value?.comments ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

	return {
		activeStream,
		activitiesError,
		commentsError,
		commentsResponse,
		isActivitiesError,
		isActivitiesLoading,
		isCommentsError,
		isCommentsLoading,
		refetchActivities,
		refetchComments,
		sortedActivities,
		sortedComments,
	};
};
