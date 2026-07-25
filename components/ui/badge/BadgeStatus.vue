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

const statusMeta: Record<TaskStatus, { label: string; color: string }> = {
	todo: { label: "To do", color: "bg-status-todo" },
	in_progress: { label: "In progress", color: "bg-status-in-progress" },
	in_review: { label: "In review", color: "bg-status-in-review" },
	done: { label: "Done", color: "bg-status-done" },
	blocked: { label: "Blocked", color: "bg-status-blocked" },
	cancelled: { label: "Cancelled", color: "bg-status-cancelled" },
};

const meta = computed(() => statusMeta[props.status]);
</script>

<template>
	<div class="text-text-secondary inline-flex w-fit items-center gap-1.5 rounded-sm border border-transparent px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase">
		<span :class="['h-1.5 w-1.5 rounded-sm', meta.color]" aria-hidden="true" />
		{{ meta.label }}
	</div>
</template>
