<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import type { Comment } from "@/types";
import { getInitials } from "@/utils";

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

const highlightMentions = (text: string): string => {
	return text.replace(/@(\w+)/g, "<span class='font-bold underline'>@$1</span>");
};
</script>

<template>
	<div class="space-y-4">
		<div v-for="comment in comments" :key="comment.id" class="flex gap-4">
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
			</div>
		</div>

		<AppTaskCommentEditor />
	</div>
</template>
