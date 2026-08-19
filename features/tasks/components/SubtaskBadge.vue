<script lang="ts" setup>
import type { Task } from "~/types";

const props = defineProps<{ task: Task }>();

const total = computed(() => props.task.subtaskCount ?? 0);
const done = computed(() => props.task.subtaskDoneCount ?? 0);
/*
 * Every child being done does not make the parent done — completion never
 * cascades — so this reads as finished progress, not as a finished task.
 */
const isComplete = computed(() => total.value > 0 && done.value === total.value);
</script>

<template>
	<span
		v-if="total"
		class="inline-flex shrink-0 items-center gap-1 font-mono text-xs tabular-nums"
		:class="isComplete ? 'text-success' : 'text-text-tertiary'"
		:title="`${done} of ${total} subtask${total === 1 ? '' : 's'} done`"
	>
		<Icon name="lucide:list-tree" :size="12" />
		{{ done }}/{{ total }}
	</span>
</template>
