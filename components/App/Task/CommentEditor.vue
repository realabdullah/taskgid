<script lang="ts" setup>
import { useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import type { Comment } from "@/types";

const { parentId } = defineProps<{ parentId?: string }>();

const route = useRoute();
const client = useQueryClient();
const { user } = storeToRefs(useStore());

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
	<Card :class="[parentId ? 'mt-3 border-none p-0 shadow-none' : 'mt-10']">
		<div :class="{ 'p-4': !parentId }">
			<div class="flex items-start gap-3">
				<Avatar v-if="!parentId" class="mt-1">
					<AvatarImage :src="user?.profilePicture || ''" :alt="user?.firstName || ''" />
					<AvatarFallback>{{ getInitials(user?.firstName, user?.lastName) }}</AvatarFallback>
				</Avatar>

				<div class="flex-1">
					<div class="relative">
						<AppTaskMentionTextarea v-model="comment" />
					</div>

					<div class="mt-3 flex justify-end">
						<Button type="button" :disabled="!comment.trim() || isAddingComment" class-name="flex items-center gap-2" @click="addComment">
							<Icon name="hugeicons:arrow-right-04" :size="16" />
							<span>Submit</span>
						</Button>
					</div>
				</div>
			</div>
		</div>
	</Card>
</template>
