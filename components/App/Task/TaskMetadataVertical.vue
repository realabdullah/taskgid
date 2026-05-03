<script lang="ts" setup>
import type { Task } from "~/types";

const props = defineProps<{
	task: Task;
}>();
</script>

<template>
	<aside class="space-y-6">
		<section class="space-y-3">
			<p class="text-text-tertiary text-xs font-semibold tracking-widest uppercase">Status</p>
			<div class="border-border bg-surface-1 inline-flex min-h-11 items-center rounded-lg border px-3">
				<BadgeStatus :status="props.task.status" />
			</div>
		</section>

		<section class="space-y-3">
			<p class="text-text-tertiary text-xs font-semibold tracking-widest uppercase">Priority</p>
			<div class="border-border bg-surface-1 inline-flex min-h-11 items-center rounded-lg border px-3">
				<BadgePriority :priority="props.task.priority" />
			</div>
		</section>

		<section class="space-y-2">
			<p class="text-text-tertiary text-xs font-semibold tracking-widest uppercase">Due date</p>
			<p class="text-text-secondary text-sm">{{ props.task.dueDate ? formatDate(props.task.dueDate, "MMM D, YYYY") : "No date" }}</p>
		</section>

		<section class="space-y-3">
			<p class="text-text-tertiary text-xs font-semibold tracking-widest uppercase">Assignees</p>
			<div v-if="props.task.assignees.length" class="space-y-3">
				<div v-for="assignee in props.task.assignees" :key="assignee.id" class="flex min-h-11 items-center gap-3">
					<Avatar class="h-8 w-8">
						<AvatarImage :src="assignee.profilePicture || ''" :alt="assignee.username" />
						<AvatarFallback class="bg-accent-subtle text-accent-text text-2xs">{{ getInitials(assignee.firstName, assignee.lastName) }}</AvatarFallback>
					</Avatar>
					<span class="text-text-secondary text-sm">{{ assignee.firstName }} {{ assignee.lastName }}</span>
				</div>
			</div>
			<p v-else class="text-text-tertiary text-sm">Unassigned</p>
		</section>

		<section class="border-border space-y-3 border-t pt-6">
			<p class="text-text-tertiary text-xs font-semibold tracking-widest uppercase">Attachments</p>
			<p class="text-text-tertiary text-sm">Coming soon</p>
		</section>

		<section class="border-border space-y-3 border-t pt-6">
			<p class="text-text-tertiary text-xs font-semibold tracking-widest uppercase">Subtasks</p>
			<p class="text-text-tertiary text-sm">Coming soon</p>
		</section>
	</aside>
</template>
