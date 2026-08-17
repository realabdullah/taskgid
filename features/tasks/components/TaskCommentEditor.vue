<script lang="ts" setup>
import type { ApiResponse, Comment } from "@/types";
import { useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import TaskMentionTextarea from "./TaskMentionTextarea.vue";

const { parentId } = defineProps<{ parentId?: string }>();

const route = useRoute();
const client = useQueryClient();

const comment = shallowRef("");
const isAddingComment = ref(false);

const addComment = async () => {
	try {
		isAddingComment.value = true;
		const url = API_ENDPOINTS.workspaces.taskComments(route.params.slug, route.params.id);
		const res = await useApiFetch<ApiResponse<Comment>>(url, {
			method: "POST",
			body: { content: comment.value, parentId },
		});
		if (!res || !res.success) throw new Error("Unable to add your comment. Try again.");

		await client.invalidateQueries({ queryKey: ["task-comments", route.params.id] });
		comment.value = "";
		toast.success("Comment added.");
	} catch (error) {
		toast.error(getServerError(error));
	} finally {
		isAddingComment.value = false;
	}
};
</script>

<template>
	<div class="relative">
		<TaskMentionTextarea v-model="comment" />

		<div class="absolute end-4 bottom-4">
			<Button type="button" :disabled="!comment.trim() || isAddingComment" class="flex items-center gap-2" @click="addComment">
				<Icon name="hugeicons:arrow-right-04" :size="16" />
				<span>Send</span>
			</Button>
		</div>
	</div>
</template>
