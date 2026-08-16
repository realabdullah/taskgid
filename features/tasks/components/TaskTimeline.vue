<script lang="ts" setup>
import { useActivityLabel } from "~/features/activity/composables/useActivityLabel";
import { useTaskTimeline } from "~/features/tasks/composables/useTaskTimeline";
import TaskMentionTextarea from "./TaskMentionTextarea.vue";

const props = defineProps<{
	workspaceSlug: string;
	taskId: string;
}>();

const { getLabel, getDescription } = useActivityLabel();
const {
	activeStream,
	activitiesError,
	addComment,
	commentDraft,
	commentsError,
	commentsResponse,
	isActivitiesError,
	isActivitiesLoading,
	isAddingComment,
	isCommentsError,
	isCommentsLoading,
	refetchActivities,
	refetchComments,
	sortedActivities,
	sortedComments,
} = useTaskTimeline({
	get workspaceSlug() {
		return props.workspaceSlug;
	},
	get taskId() {
		return props.taskId;
	},
});
</script>

<template>
	<section class="space-y-4">
		<div class="border-border flex items-center justify-between border-b pb-3">
			<div class="flex items-center gap-4">
				<Pressable
					static
					class="border-b-2 pb-2 text-sm font-semibold"
					:class="activeStream === 'comments' ? 'border-primary text-text-primary' : 'text-text-tertiary border-transparent'"
					@click="activeStream = 'comments'"
				>
					Comments <span class="ms-1 font-mono text-xs tabular-nums">{{ commentsResponse?.pagination?.total || 0 }}</span>
				</Pressable>
				<Pressable
					static
					class="border-b-2 pb-2 text-sm font-semibold"
					:class="activeStream === 'history' ? 'border-primary text-text-primary' : 'text-text-tertiary border-transparent'"
					@click="activeStream = 'history'"
				>
					Activity <span class="ms-1 font-mono text-xs tabular-nums">{{ sortedActivities.length }}</span>
				</Pressable>
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
			heading="Unable to load the timeline"
			:body="String(activitiesError || commentsError || 'Check your connection and try again.')"
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
							<p class="text-text-tertiary text-xs tabular-nums">{{ getTimeAgo(new Date(comment.createdAt)) }}</p>
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
							<p class="text-text-tertiary text-xs tabular-nums">{{ getTimeAgo(new Date(activity.createdAt)) }}</p>
						</div>
					</div>
				</article>
			</div>
			<p v-else class="text-text-tertiary text-sm">{{ activeStream === "comments" ? "No comments yet." : "No history recorded yet." }}</p>
		</div>

		<div class="border-border bg-surface-0/85 sticky bottom-0 z-20 border-t pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur">
			<div class="relative">
				<TaskMentionTextarea v-model="commentDraft" />
				<div class="absolute end-3 bottom-3">
					<Button type="button" class="h-11 px-4" :disabled="!commentDraft.trim() || isAddingComment" @click="addComment">
						<Icon name="hugeicons:arrow-right-04" :size="16" />
						<span>Send</span>
					</Button>
				</div>
			</div>
		</div>
	</section>
</template>
