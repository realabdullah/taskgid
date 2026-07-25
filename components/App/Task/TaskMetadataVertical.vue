<script lang="ts" setup>
import type { Task } from "~/types";

const props = defineProps<{
	task: Task;
}>();
</script>

<template>
	<dl class="border-border divide-border divide-y border-y">
		<div class="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4 py-4">
			<dt class="text-text-tertiary font-mono text-[10px] font-semibold tracking-[0.1em] uppercase">Status</dt>
			<dd><BadgeStatus :status="props.task.status" /></dd>
		</div>

		<div class="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4 py-4">
			<dt class="text-text-tertiary font-mono text-[10px] font-semibold tracking-[0.1em] uppercase">Priority</dt>
			<dd><BadgePriority :priority="props.task.priority" /></dd>
		</div>

		<div class="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4 py-4">
			<dt class="text-text-tertiary font-mono text-[10px] font-semibold tracking-[0.1em] uppercase">Due</dt>
			<dd class="text-text-primary text-sm font-medium">{{ props.task.dueDate ? formatDate(props.task.dueDate, "MMM D, YYYY") : "No due date" }}</dd>
		</div>

		<div class="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4 py-4">
			<dt class="text-text-tertiary font-mono text-[10px] font-semibold tracking-[0.1em] uppercase">Assignees</dt>
			<dd v-if="props.task.assignees.length" class="space-y-3">
				<div v-for="assignee in props.task.assignees" :key="assignee.id" class="flex min-h-8 items-center gap-2.5">
					<Avatar class="h-7 w-7">
						<AvatarImage :src="assignee.profilePicture || ''" :alt="assignee.username" />
						<AvatarFallback class="bg-accent-subtle text-accent-text text-2xs">{{ getInitials(assignee.firstName, assignee.lastName) }}</AvatarFallback>
					</Avatar>
					<span class="text-text-primary truncate text-sm font-medium">{{ assignee.firstName }} {{ assignee.lastName }}</span>
				</div>
			</dd>
			<dd v-else class="text-text-tertiary text-sm">Unassigned</dd>
		</div>
	</dl>
</template>
