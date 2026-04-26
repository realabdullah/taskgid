<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import type { Comment, Pagination } from "@/types";
import { useQuery } from "@tanstack/vue-query";

const route = useRoute();

const {
	data,
	isPending: isCommentsLoading,
	isError: isCommentsError,
	error: commentsError,
	refetch: refetchComments,
} = useQuery({
	queryKey: ["task-comments", route.params.id],
	queryFn: async () => {
		const { success, data, pagination } = await useApiFetch<{
			success: boolean;
			data: Comment[];
			pagination: Pagination;
		}>(API_ENDPOINTS.workspaces.taskComments(useRoute().params.slug, route.params.id));
		if (!data || !success) throw new Error("Failed to fetch task comments");
		return { comments: data, pagination };
	},
});
</script>

<template>
	<Card>
		<CardHeader>
			<CardTitle class="text-lg">Comments ({{ data?.pagination.total || 0 }})</CardTitle>
		</CardHeader>

		<CardContent>
			<div v-if="isCommentsLoading" class="space-y-2">
				<Skeleton class="h-9 w-full" />
				<Skeleton class="h-18 w-full" />
				<Skeleton class="h-18 w-full" />
			</div>

			<AppEmptyState
				v-else-if="isCommentsError"
				heading="Could not load comments"
				:body="String(commentsError || 'Please try again in a moment.')"
				icon="lucide:alert-circle"
				:action="{ label: 'Retry', onClick: () => refetchComments(), variant: 'secondary' }"
			/>

			<div v-else class="space-y-4">
				<AppTaskCommentEditor />
				<Separator />
				<template v-if="data?.comments.length">
					<AppTaskComment v-for="comment in data?.comments" :key="comment.id" :comment="comment" />
				</template>
				<p v-else class="text-text-tertiary text-sm">No comments yet. Start the discussion.</p>
			</div>
		</CardContent>
	</Card>
</template>
