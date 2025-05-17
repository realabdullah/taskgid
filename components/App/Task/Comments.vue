<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import type { Comment, Pagination } from "@/types";

const route = useRoute();

const { data } = useQuery({
	queryKey: ["task-comments", route.params.id],
	queryFn: async () => {
		const { success, data, pagination } = await useApiFetch<{
			success: boolean;
			data: Comment[];
			pagination: Pagination;
		}>(`/workspaces/${useRoute().params.slug}/tasks/${route.params.id}/comments`);
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
			<div class="space-y-4">
				<AppTaskCommentEditor />
				<Separator />
				<AppTaskComment v-for="comment in data?.comments" :key="comment.id" :comment="comment" />
			</div>
		</CardContent>
	</Card>
</template>
