<script lang="ts" setup>
import { useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import { cn } from "@/lib/utils";
import type { Comment } from "@/types";

const { parentId } = defineProps<{ parentId?: string }>();

const route = useRoute();
const client = useQueryClient();
const { user } = storeToRefs(useStore());

const comment = shallowRef("");
const isBold = shallowRef(false);
const isItalic = shallowRef(false);

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
	<Card class="mt-10">
		<div class="p-4">
			<div class="flex items-start gap-3">
				<Avatar class="mt-1">
					<AvatarImage :src="user?.profilePicture || ''" :alt="user?.firstName || ''" />
					<AvatarFallback>{{ getInitials(user?.firstName, user?.lastName) }}</AvatarFallback>
				</Avatar>

				<div class="flex-1">
					<div class="mb-2 flex items-center gap-2">
						<Button type="button" size="icon" variant="ghost" :class="cn('h-8 w-8', isBold && 'bg-muted')">
							<Icon name="hugeicons:text-bold" :size="16" />
						</Button>
						<Button type="button" size="icon" variant="ghost" :class="cn('h-8 w-8', isItalic && 'bg-muted')">
							<Icon name="hugeicons:text-italic" :size="16" />
						</Button>
					</div>

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
