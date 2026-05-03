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
const showActivity = ref(false);

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

const timelineItems = computed(() => {
	const items: Array<{ type: "activity"; id: string; createdAt: string; activity: ActivityDetails } | { type: "comment"; id: string; createdAt: string; comment: Comment }> = [];

	for (const activity of activities.value ?? []) {
		items.push({ type: "activity", id: activity.id, createdAt: activity.createdAt, activity });
	}

	for (const comment of commentsResponse.value?.comments ?? []) {
		items.push({ type: "comment", id: comment.id, createdAt: comment.createdAt, comment });
	}

	return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
});

const visibleTimelineItems = computed(() => {
	if (showActivity.value) {
		return timelineItems.value;
	}

	return timelineItems.value.filter((item) => item.type === "comment");
});

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
		<div class="flex items-center justify-between">
			<p class="text-text-tertiary text-xs font-semibold tracking-widest uppercase">Comments</p>
			<div class="flex items-center gap-2">
				<p class="text-text-tertiary text-xs">{{ commentsResponse?.pagination?.total || 0 }} comments</p>
				<Button variant="ghost" size="sm" class="text-text-tertiary h-8 px-2 text-xs" @click="showActivity = !showActivity">
					<Icon :name="showActivity ? 'lucide:eye-off' : 'lucide:history'" :size="14" />
					<span>{{ showActivity ? "Hide history" : "Show history" }}</span>
				</Button>
			</div>
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
			<div v-if="visibleTimelineItems.length" class="flex flex-col gap-4">
				<article v-for="item in visibleTimelineItems" :key="`${item.type}-${item.id}`" class="border-border border-b pb-4 last:border-b-0">
					<div v-if="item.type === 'comment'" class="flex items-start gap-3">
						<Avatar class="h-8 w-8">
							<AvatarImage :src="item.comment.user.profilePicture || ''" :alt="item.comment.user.username" />
							<AvatarFallback class="bg-accent-subtle text-accent-text text-2xs">{{ getInitials(item.comment.user.firstName, item.comment.user.lastName) }}</AvatarFallback>
						</Avatar>
						<div class="min-w-0 flex-1 space-y-1">
							<p class="text-text-primary text-sm font-medium">{{ item.comment.user.firstName }} {{ item.comment.user.lastName }}</p>
							<p class="text-text-secondary text-sm leading-6" v-html="highlightMentions(item.comment.content)"></p>
							<p class="text-text-tertiary text-2xs">{{ getTimeAgo(new Date(item.comment.createdAt)) }}</p>
						</div>
					</div>

					<div v-else class="flex items-start gap-3">
						<div class="bg-surface-1 text-text-tertiary flex h-8 w-8 items-center justify-center rounded-full border">
							<Icon name="lucide:history" :size="14" />
						</div>
						<div class="min-w-0 flex-1 space-y-1">
							<p class="text-text-primary text-sm">{{ getLabel(item.activity) }}</p>
							<p v-if="getDescription(item.activity)" class="text-text-secondary text-sm leading-6" v-html="getDescription(item.activity) || ''"></p>
							<p class="text-text-tertiary text-2xs">{{ getTimeAgo(new Date(item.activity.createdAt)) }}</p>
						</div>
					</div>
				</article>
			</div>
			<p v-else class="text-text-tertiary text-sm">{{ showActivity ? "No comments or activity yet." : "No comments yet." }}</p>
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
