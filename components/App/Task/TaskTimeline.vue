<script lang="ts" setup>
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import type { ActivityDetails, Comment } from "~/types";

const props = defineProps<{
	workspaceSlug: string;
	taskId: string;
}>();

const client = useQueryClient();
const { getLabel, getDescription } = useActivityLabel();

const commentDraft = ref("");
const isAddingComment = ref(false);
const activeStream = ref<"comments" | "history">("comments");

const {
	data: activities,
	isFetching: isActivitiesLoading,
	isError: isActivitiesError,
	error: activitiesError,
	refetch: refetchActivities,
} = useQuery({
	queryKey: computed(() => ["task-activities", props.workspaceSlug, props.taskId]),
	queryFn: async () => {
		const { success, data } = await useApiFetch<{ success: boolean; data: ActivityDetails[] }>(API_ENDPOINTS.workspaces.taskActivities(props.workspaceSlug, props.taskId));
		if (!success || !data) {
			throw new Error("Failed to fetch task activities");
		}
		return data;
	},
	enabled: computed(() => Boolean(props.workspaceSlug && props.taskId)),
});

const {
	data: commentsResponse,
	isFetching: isCommentsLoading,
	isError: isCommentsError,
	error: commentsError,
	refetch: refetchComments,
} = useQuery({
	queryKey: computed(() => ["task-comments", props.workspaceSlug, props.taskId]),
	queryFn: async () => {
		const { success, data, pagination } = await useApiFetch<{ success: boolean; data: Comment[]; pagination: { total: number } }>(
			API_ENDPOINTS.workspaces.taskComments(props.workspaceSlug, props.taskId)
		);
		if (!success || !data) {
			throw new Error("Failed to fetch task comments");
		}
		return { comments: data, pagination };
	},
	enabled: computed(() => Boolean(props.workspaceSlug && props.taskId)),
});

const sortedActivities = computed(() => [...(activities.value ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
const sortedComments = computed(() => [...(commentsResponse.value?.comments ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

const addComment = async () => {
	const content = commentDraft.value.trim();
	if (!content) {
		return;
	}

	try {
		isAddingComment.value = true;
		const { success } = await useApiFetch<{ success: boolean }>(API_ENDPOINTS.workspaces.taskComments(props.workspaceSlug, props.taskId), {
			method: "POST",
			body: { content },
		});

		if (!success) {
			throw new Error("Failed to add comment");
		}

		commentDraft.value = "";
		await Promise.all([
			client.invalidateQueries({ queryKey: ["task-comments", props.workspaceSlug, props.taskId] }),
			client.invalidateQueries({ queryKey: ["task-activities", props.workspaceSlug, props.taskId] }),
		]);
		toast.success("Comment added successfully.");
	} catch (error) {
		toast.error(getServerError(error));
	} finally {
		isAddingComment.value = false;
	}
};
</script>

<template>
	<section class="space-y-4">
		<div class="border-border flex items-center justify-between border-b pb-3">
			<div class="flex items-center gap-4">
				<button
					type="button"
					class="interactive border-b-2 pb-2 text-sm font-semibold"
					:class="activeStream === 'comments' ? 'border-primary text-text-primary' : 'text-text-tertiary border-transparent'"
					@click="activeStream = 'comments'"
				>
					Comments <span class="ml-1 font-mono text-xs">{{ commentsResponse?.pagination?.total || 0 }}</span>
				</button>
				<button
					type="button"
					class="interactive border-b-2 pb-2 text-sm font-semibold"
					:class="activeStream === 'history' ? 'border-primary text-text-primary' : 'text-text-tertiary border-transparent'"
					@click="activeStream = 'history'"
				>
					Activity <span class="ml-1 font-mono text-xs">{{ sortedActivities.length }}</span>
				</button>
			</div>
			<p class="text-text-tertiary hidden text-xs sm:block">{{ activeStream === "comments" ? "Task comments" : "Task activity" }}</p>
		</div>

		<div v-if="isActivitiesLoading || isCommentsLoading" class="space-y-3">
			<Skeleton class="h-16 w-full" />
			<Skeleton class="h-16 w-full" />
			<Skeleton class="h-16 w-full" />
		</div>

		<AppEmptyState
			v-else-if="isActivitiesError || isCommentsError"
			heading="Could not load timeline"
			:body="String(activitiesError || commentsError || 'Please try again.')"
			icon="lucide:alert-circle"
			:action="{
				label: 'Retry',
				onClick: () => {
					refetchActivities();
					refetchComments();
				},
				variant: 'secondary',
			}"
		/>

		<div v-else class="space-y-4">
			<div v-if="activeStream === 'comments' && sortedComments.length" class="flex flex-col gap-4">
				<article v-for="comment in sortedComments" :key="comment.id" class="border-border border-b pb-4 last:border-b-0">
					<div class="flex items-start gap-3">
						<Avatar class="h-8 w-8">
							<AvatarImage :src="comment.user.profilePicture || ''" :alt="comment.user.username" />
							<AvatarFallback class="bg-accent-subtle text-accent-text text-2xs">{{ getInitials(comment.user.firstName, comment.user.lastName) }}</AvatarFallback>
						</Avatar>
						<div class="min-w-0 flex-1 space-y-1">
							<p class="text-text-primary text-sm font-medium">{{ comment.user.firstName }} {{ comment.user.lastName }}</p>
							<p class="text-text-secondary text-sm leading-6" v-html="highlightMentions(comment.content)"></p>
							<p class="text-text-tertiary text-2xs">{{ getTimeAgo(new Date(comment.createdAt)) }}</p>
						</div>
					</div>
				</article>
			</div>
			<div v-else-if="activeStream === 'history' && sortedActivities.length" class="flex flex-col gap-4">
				<article v-for="activity in sortedActivities" :key="activity.id" class="border-border border-b pb-4 last:border-b-0">
					<div class="flex items-start gap-3">
						<div class="bg-surface-1 text-text-tertiary flex h-8 w-8 items-center justify-center border">
							<Icon name="lucide:history" :size="14" />
						</div>
						<div class="min-w-0 flex-1 space-y-1">
							<p class="text-text-primary text-sm">{{ getLabel(activity) }}</p>
							<p v-if="getDescription(activity)" class="text-text-secondary text-sm leading-6" v-html="getDescription(activity) || ''"></p>
							<p class="text-text-tertiary text-2xs">{{ getTimeAgo(new Date(activity.createdAt)) }}</p>
						</div>
					</div>
				</article>
			</div>
			<p v-else class="text-text-tertiary text-sm">{{ activeStream === "comments" ? "No comments yet." : "No history recorded yet." }}</p>
		</div>

		<div class="border-border bg-surface-0/85 sticky bottom-0 z-20 border-t pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur">
			<div class="relative">
				<AppTaskMentionTextarea v-model="commentDraft" />
				<div class="absolute right-3 bottom-3">
					<Button type="button" class="h-11 px-4" :disabled="!commentDraft.trim() || isAddingComment" @click="addComment">
						<Icon name="hugeicons:arrow-right-04" :size="16" />
						<span>Send</span>
					</Button>
				</div>
			</div>
		</div>
	</section>
</template>
