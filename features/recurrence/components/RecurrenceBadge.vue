<script lang="ts" setup>
import type { Task } from "~/types";

const props = defineProps<{ task: Task }>();

/*
 * Marks a task as one a schedule produced. Worth showing because it changes
 * what completing it means: this one is done, and another will arrive.
 */
const label = computed(() => (props.task.occurrenceDate ? `From a schedule · ${formatDate(props.task.occurrenceDate, "MMM D")}` : "From a schedule"));
</script>

<template>
	<span v-if="task.recurrenceId" class="text-text-tertiary inline-flex shrink-0 items-center gap-1 text-xs" :title="label">
		<Icon name="lucide:repeat" :size="12" />
	</span>
</template>
