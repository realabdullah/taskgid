<script lang="ts" setup>
import { useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import type { Comment } from "@/types";

const { parentId } = defineProps<{ parentId?: string }>();

const route = useRoute();
const client = useQueryClient();

const comment = shallowRef("");
const isAddingComment = ref(false);

const addComment = async () => {
	try {
		isAddingComment.value = true;
		const url = `/workspaces/${route.params.slug}/tasks/${route.params.id}/comments`;
		const res = await useApiFetch<{ success: boolean; data: Comment }>(url, {
			method: "POST",
			body: { content: comment.value, parentId },
		});
		if (!res || !res.success) throw new Error("Failed to add comment");

		await client.invalidateQueries({ queryKey: ["task-comments", route.params.id] });
		comment.value = "";
		toast.success("Comment added successfully");
	} catch (error) {
		toast.error(String(error));
	} finally {
		isAddingComment.value = false;
	}
};
</script>

<template>
	<div class="relative">
		<AppTaskMentionTextarea v-model="comment" />

		<div class="absolute right-4 bottom-4">
			<Button type="button" :disabled="!comment.trim() || isAddingComment" class="flex items-center gap-2" @click="addComment">
				<Icon name="hugeicons:arrow-right-04" :size="16" />
				<span>Send</span>
			</Button>
		</div>
	</div>
</template>
