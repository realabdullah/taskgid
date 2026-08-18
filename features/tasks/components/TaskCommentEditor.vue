<script lang="ts" setup>
import type { ApiResponse, Comment } from "@/types";
import { useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import TaskMentionTextarea from "./TaskMentionTextarea.vue";

const props = defineProps<{ parentId?: string; workspaceSlug: string; taskId: string }>();
const { parentId } = toRefs(props);

const client = useQueryClient();

const comment = shallowRef("");
const isAddingComment = ref(false);

const addComment = async () => {
	try {
		isAddingComment.value = true;
		const url = API_ENDPOINTS.workspaces.taskComments(props.workspaceSlug, props.taskId);
		const res = await useApiFetch<ApiResponse<Comment>>(url, {
			method: "POST",
			body: { content: comment.value, parentId: parentId.value },
		});
		if (!res || !res.success) throw new Error("Unable to add your comment. Try again.");

		await client.invalidateQueries({ queryKey: ["task-comments", props.workspaceSlug, props.taskId] });
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
