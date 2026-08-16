import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import type { ActivityDetails, Comment } from "~/types";

type TaskTimelineOptions = { workspaceSlug: string; taskId: string };

export const useTaskTimeline = (options: TaskTimelineOptions) => {
	const client = useQueryClient();
	const commentDraft = ref("");
	const isAddingComment = ref(false);
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
			const { success, data } = await useApiFetch<{ success: boolean; data: ActivityDetails[] }>(API_ENDPOINTS.workspaces.taskActivities(options.workspaceSlug, options.taskId));
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
			const { success, data, pagination } = await useApiFetch<{ success: boolean; data: Comment[]; pagination: { total: number } }>(
				API_ENDPOINTS.workspaces.taskComments(options.workspaceSlug, options.taskId)
			);
			if (!success || !data) throw new Error("Unable to load task comments. Try again.");
			return { comments: data, pagination };
		},
		enabled: computed(() => Boolean(options.workspaceSlug && options.taskId)),
	});

	const sortedActivities = computed(() => [...(activities.value ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
	const sortedComments = computed(() => [...(commentsResponse.value?.comments ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

	const addComment = async () => {
		const content = commentDraft.value.trim();
		if (!content) return;
		try {
			isAddingComment.value = true;
			const { success } = await useApiFetch<{ success: boolean }>(API_ENDPOINTS.workspaces.taskComments(options.workspaceSlug, options.taskId), {
				method: "POST",
				body: { content },
			});
			if (!success) throw new Error("Unable to add your comment. Try again.");
			commentDraft.value = "";
			await Promise.all([
				client.invalidateQueries({ queryKey: ["task-comments", options.workspaceSlug, options.taskId] }),
				client.invalidateQueries({ queryKey: ["task-activities", options.workspaceSlug, options.taskId] }),
			]);
			toast.success("Comment added.");
		} catch (error) {
			toast.error(getServerError(error));
		} finally {
			isAddingComment.value = false;
		}
	};

	return {
		activeStream,
		activitiesError,
		addComment,
		commentDraft,
		commentsError,
		commentsResponse,
		isActivitiesError,
		isActivitiesLoading,
		isAddingComment,
		isCommentsError,
		isCommentsLoading,
		refetchActivities,
		refetchComments,
		sortedActivities,
		sortedComments,
	};
};
