<script lang="ts" setup>
import type { Comment } from "@/types";
import { useQuery } from "@tanstack/vue-query";
import { useCommentReactions } from "../composables/useCommentReactions";
import TaskCommentEditor from "./TaskCommentEditor.vue";

defineOptions({ name: "TaskComment" });

const { comment, isNested, workspaceSlug, taskId } = defineProps<{ comment: Comment; isNested?: boolean; workspaceSlug: string; taskId: string }>();

const showCommentReplies = ref(false);
const { toggle } = useCommentReactions({ workspaceSlug, taskId });

const {
	data: replies,
	isFetching,
	isError: isRepliesError,
	error: repliesError,
	refetch: refetchReplies,
} = useQuery({
	queryKey: ["task-replies", comment.id],
	queryFn: async () => {
		const { data } = await fetchAllPages<Comment>(API_ENDPOINTS.workspaces.taskCommentReplies(workspaceSlug, taskId, comment.id));
		return data;
	},
	enabled: () => showCommentReplies.value && comment.replyCount > 0,
	staleTime: 3 * 60 * 60 * 1000,
});
</script>

<template>
	<div class="flex gap-4">
		<Avatar class="h-8 w-8">
			<AvatarImage :src="comment.user.profilePicture" :alt="comment.user.firstName" />
			<AvatarFallback>{{ getInitials(comment.user.firstName, comment.user.lastName) }}</AvatarFallback>
		</Avatar>
		<div class="flex-1 space-y-1">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<span class="text-sm font-medium">{{ comment.user.firstName }} {{ comment.user.lastName }}</span>
					<span class="text-muted-foreground text-xs tabular-nums">{{ formatDate(comment.updatedAt, "MMM, Do YYYY hh:mmA") }}</span>
				</div>
			</div>
			<p class="text-sm" v-html="highlightMentions(comment.content)"></p>

			<div class="mt-3 flex items-center gap-3">
				<div v-if="!isNested" class="flex items-center justify-center gap-1 p-1">
					<Button variant="ghost" class="h-5 cursor-pointer p-0" @click="showCommentReplies = !showCommentReplies"> <Icon name="hugeicons:comment-02" :size="16" /> </Button>
					<span class="text-xs tabular-nums">{{ comment.replyCount }} {{ comment.replyCount === 1 ? "reply" : "replies" }}</span>
				</div>
				<div class="flex items-center justify-center gap-1 p-1">
					<Button
						variant="ghost"
						class="h-5 cursor-pointer p-0"
						:aria-pressed="comment.likedByMe"
						:aria-label="comment.likedByMe ? 'Remove your like' : 'Like this comment'"
						@click="toggle.mutate({ comment })"
					>
						<Icon name="hugeicons:thumbs-up" :size="16" :class="comment.likedByMe ? 'text-primary' : ''" />
					</Button>
					<span class="text-xs tabular-nums">{{ comment.likeCount }} {{ comment.likeCount === 1 ? "like" : "likes" }}</span>
				</div>
			</div>

			<div v-if="showCommentReplies" class="ms-4">
				<div class="mt-5 space-y-4">
					<template v-if="isFetching">
						<div class="flex items-center justify-center gap-2">
							<AppSpinner class="h-4 w-4" />
							<span class="text-muted-foreground text-sm">Loading replies…</span>
						</div>
					</template>
					<template v-else-if="isRepliesError">
						<div class="border-border bg-surface-1 rounded-md border p-3">
							<p class="text-danger text-sm">{{ String(repliesError || "Unable to load replies.") }}</p>
							<Button variant="secondary" size="sm" class="mt-2 h-7" @click="refetchReplies">Retry</Button>
						</div>
					</template>
					<template v-else-if="replies?.length">
						<TaskComment v-for="reply in replies" :key="reply.id" :comment="reply" :workspace-slug="workspaceSlug" :task-id="taskId" is-nested />
					</template>
					<p v-else class="text-text-tertiary text-xs">No replies yet.</p>
				</div>

				<TaskCommentEditor :parent-id="comment.id" :workspace-slug="workspaceSlug" :task-id="taskId" />
			</div>
		</div>
	</div>
</template>
