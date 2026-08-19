import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import type { ApiResponse, Comment } from "~/types";

export const MAX_COMMENT_LENGTH = 4000;

/** Composing one comment, or one reply when `parentId` is given. */
export const useTaskCommentComposer = (workspaceSlug: MaybeRefOrGetter<string>, taskId: MaybeRefOrGetter<string>, parentId?: MaybeRefOrGetter<string | undefined>) => {
	const client = useQueryClient();
	const slug = computed(() => toValue(workspaceSlug));
	const task = computed(() => toValue(taskId));
	const parent = computed(() => toValue(parentId));

	const draft = ref("");

	const trimmed = computed(() => draft.value.trim());
	const remaining = computed(() => MAX_COMMENT_LENGTH - draft.value.length);
	const isTooLong = computed(() => remaining.value < 0);
	const canSubmit = computed(() => Boolean(trimmed.value) && !isTooLong.value);

	const submit = useMutation({
		mutationFn: async (content: string) => {
			const response = await useApiFetch<ApiResponse<Comment>>(API_ENDPOINTS.workspaces.taskComments(slug.value, task.value), {
				method: "POST",
				body: { content, parentId: parent.value },
			});
			if (!response?.success) throw new Error(response?.error || "Unable to add your comment. Try again.");
			return response.data;
		},
		onSuccess: async () => {
			draft.value = "";
			// Posting a comment is also recorded as activity, so the history stream
			// goes stale at the same moment the comment list does.
			await Promise.all([client.invalidateQueries({ queryKey: ["task-comments", slug.value, task.value] }), client.invalidateQueries({ queryKey: ["task-activities", slug.value, task.value] })]);
			toast.success("Comment added.");
		},
		onError: (error) => toast.error(getServerError(error)),
	});

	return { canSubmit, draft, isTooLong, remaining, submit };
};
