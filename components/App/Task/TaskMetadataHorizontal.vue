<script lang="ts" setup>
import type { Task } from "~/types"

const props = defineProps<{
	task: Task;
}>();
</script>

<template>
	<div class="no-scrollbar -mx-1 flex snap-x items-center gap-2 overflow-x-auto px-1 py-1 md:gap-3">
		<div class="border-border bg-surface-1 text-text-secondary inline-flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-full border px-3 text-sm">
			<span class="text-text-tertiary text-xs uppercase">Status</span>
			<BadgeStatus :status="props.task.status" />
		</div>

		<div class="border-border bg-surface-1 text-text-secondary inline-flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-full border px-3 text-sm">
			<span class="text-text-tertiary text-xs uppercase">Priority</span>
			<BadgePriority :priority="props.task.priority" />
		</div>

		<div class="border-border bg-surface-1 text-text-secondary inline-flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-full border px-3 text-sm">
			<span class="text-text-tertiary text-xs uppercase">Due</span>
			<span>{{ props.task.dueDate ? formatDate(props.task.dueDate, "MMM D, YYYY") : "No date" }}</span>
		</div>

		<div class="border-border bg-surface-1 text-text-secondary inline-flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-full border px-3 text-sm">
			<span class="text-text-tertiary text-xs uppercase">Assignees</span>
			<div v-if="props.task.assignees.length" class="flex items-center gap-2">
				<Avatar v-for="assignee in props.task.assignees.slice(0, 3)" :key="assignee.id" class="h-7 w-7">
					<AvatarImage :src="assignee.profilePicture || ''" :alt="assignee.username" />
					<AvatarFallback class="bg-accent-subtle text-accent-text text-2xs">{{ getInitials(assignee.firstName, assignee.lastName) }}</AvatarFallback>
				</Avatar>
				<span v-if="props.task.assignees.length > 3" class="text-text-tertiary text-xs">+{{ props.task.assignees.length - 3 }}</span>
			</div>
			<span v-else class="text-text-tertiary">Unassigned</span>
		</div>
	</div>
</template>
