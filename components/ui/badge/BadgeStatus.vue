<script setup lang="ts">
type TaskStatus = "todo" | "in_progress" | "in_review" | "done" | "blocked" | "cancelled";

const props = withDefaults(
	defineProps<{
		status?: TaskStatus;
	}>(),
	{
		status: "todo",
	}
);

const statusMeta: Record<TaskStatus, { label: string; classes: string }> = {
	todo: { label: "To do", classes: "bg-status-todo-bg text-status-todo" },
	in_progress: { label: "In progress", classes: "bg-status-in-progress-bg text-status-in-progress" },
	in_review: { label: "In review", classes: "bg-status-in-review-bg text-status-in-review" },
	done: { label: "Done", classes: "bg-status-done-bg text-status-done" },
	blocked: { label: "Blocked", classes: "bg-status-blocked-bg text-status-blocked" },
	cancelled: { label: "Cancelled", classes: "bg-status-cancelled-bg text-status-cancelled" },
};

const meta = computed(() => statusMeta[props.status]);
</script>

<template>
	<div :class="['inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium', meta.classes]">
		<span class="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
		{{ meta.label }}
	</div>
</template>
