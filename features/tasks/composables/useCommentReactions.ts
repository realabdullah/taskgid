import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import type { ApiResponse, Comment, PaginatedResponse } from "~/types";

type ReactionTarget = { workspaceSlug: string; taskId: string };

/** Applies a like change to whichever cached list holds the comment. */
const patchCachedComment = (comment: Comment, liked: boolean): Comment => ({
	...comment,
	likedByMe: liked,
	likeCount: Math.max(0, comment.likeCount + (liked ? 1 : -1)),
});

/**
 * Like and unlike a comment, optimistically.
 *
 * The server rejects a duplicate like with a 400, so the toggle is driven by
 * `likedByMe` from the comment payload rather than by local guessing.
 */
export const useCommentReactions = ({ workspaceSlug, taskId }: ReactionTarget) => {
	const client = useQueryClient();
	const commentsKey = ["task-comments", workspaceSlug, taskId];

	const applyOptimistic = (commentId: string, liked: boolean) => {
		client.setQueryData<PaginatedResponse<Comment>>(commentsKey, (current) =>
			current ? { ...current, data: current.data.map((item) => (item.id === commentId ? patchCachedComment(item, liked) : item)) } : current
		);
		// Replies live in their own cache entry, keyed by the parent comment.
		client.setQueriesData<Comment[]>({ queryKey: ["task-replies"] }, (current) => current?.map((item) => (item.id === commentId ? patchCachedComment(item, liked) : item)));
	};

	const toggle = useMutation({
		mutationFn: async ({ comment }: { comment: Comment }) => {
			const liked = !comment.likedByMe;
			const response = await useApiFetch<ApiResponse>(API_ENDPOINTS.workspaces.taskCommentLike(workspaceSlug, taskId, comment.id), {
				method: liked ? "POST" : "DELETE",
			});
			if (!response?.success) throw new Error(response?.error || "Unable to update the reaction. Try again.");
			return liked;
		},
		onMutate: async ({ comment }) => {
			await client.cancelQueries({ queryKey: commentsKey });
			const liked = !comment.likedByMe;
			applyOptimistic(comment.id, liked);
			return { comment };
		},
		onError: (error, _variables, context) => {
			if (context?.comment) applyOptimistic(context.comment.id, context.comment.likedByMe);
			toast.error(getServerError(error));
		},
		onSettled: () => {
			void client.invalidateQueries({ queryKey: commentsKey });
			void client.invalidateQueries({ queryKey: ["task-replies"] });
		},
	});

	return { toggle };
};
