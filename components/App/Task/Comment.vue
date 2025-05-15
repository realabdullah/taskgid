<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import type { Comment } from "@/types";

const { comment, isNested } = defineProps<{ comment: Comment; isNested?: boolean }>();

const showCommentReplies = ref(false);
const route = useRoute();

const { data: replies, isFetching } = useQuery({
	queryKey: ["task-replies", comment.id],
	queryFn: async () => {
		const { success, data } = await useApiFetch<{
			success: boolean;
			data: Comment[];
		}>(`/workspaces/${route.params.slug}/tasks/${route.params.id}/comments/${comment.id}/replies`);
		if (!data || !success) return [];
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
					<span class="text-sm font-medium">{{ comment.user.firstName }} {{ comment.user.firstName }}</span>
					<span class="text-muted-foreground text-xs">{{ formatDate(comment.updatedAt, "MMM, Do YYYY hh:mmA") }}</span>
				</div>
			</div>
			<p class="text-sm" v-html="highlightMentions(comment.content)"></p>

			<div class="mt-3 flex items-center gap-3">
				<div v-if="!isNested" class="flex items-center justify-center gap-1 p-1">
					<Button variant="ghost" class="h-5 cursor-pointer p-0" @click="showCommentReplies = !showCommentReplies"> <Icon name="hugeicons:comment-02" :size="16" /> </Button>
					<span class="text-xs">{{ comment.replyCount }} {{ comment.replyCount === 1 ? "reply" : "replies" }}</span>
				</div>
				<div class="flex items-center justify-center gap-1 p-1">
					<Button variant="ghost" class="h-5 cursor-pointer p-0"><Icon name="hugeicons:thumbs-up" :size="16" /> </Button>
					<span class="text-xs">{{ comment.likeCount }} {{ comment.likeCount === 1 ? "like" : "likes" }}</span>
				</div>
			</div>

			<div v-if="showCommentReplies" class="ml-4">
				<div class="mt-5 space-y-4">
					<template v-if="isFetching">
						<div class="flex items-center justify-center gap-2">
							<AppSpinner class="h-4 w-4" />
							<span class="text-muted-foreground text-sm">Loading...</span>
						</div>
					</template>
					<template v-else>
						<AppTaskComment v-for="reply in replies" :key="reply.id" :comment="reply" is-nested />
					</template>
				</div>

				<AppTaskCommentEditor :parent-id="comment.id" />
			</div>
		</div>
	</div>
</template>
