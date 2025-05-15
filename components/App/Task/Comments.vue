<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import type { Comment } from "@/types";

const route = useRoute();

const { data: comments } = useQuery({
	queryKey: ["task-comments", route.params.id],
	queryFn: async () => {
		const { success, data } = await useApiFetch<{
			success: boolean;
			data: Comment[];
		}>(`/workspaces/${useRoute().params.slug}/tasks/${route.params.id}/comments`);
		if (!data || !success) throw new Error("Failed to fetch task comments");
		return data;
	},
});
</script>

<template>
	<div class="space-y-4">
		<AppTaskComment v-for="comment in comments" :key="comment.id" :comment="comment" />
		<AppTaskCommentEditor />
	</div>
</template>
