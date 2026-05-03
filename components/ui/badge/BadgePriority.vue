<script setup lang="ts">
import { computed } from "vue";

type TaskPriority = "urgent" | "high" | "medium" | "low" | "none";

const props = defineProps<{
	priority: TaskPriority;
}>();

const priorityMeta: Record<TaskPriority, { label: string; color: string }> = {
	urgent: { label: "Urgent", color: "text-priority-urgent" },
	high: { label: "High", color: "text-priority-high" },
	medium: { label: "Medium", color: "text-priority-medium" },
	low: { label: "Low", color: "text-priority-low" },
	none: { label: "None", color: "text-priority-none" },
};

const meta = computed(() => priorityMeta[props.priority]);
</script>

<template>
	<span class="border-border bg-surface-0 text-text-primary inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium">
		<Icon name="lucide:triangle-alert" :class="['h-2.5 w-2.5 fill-current', meta.color]" aria-hidden="true" />
		{{ meta.label }}
	</span>
</template>
