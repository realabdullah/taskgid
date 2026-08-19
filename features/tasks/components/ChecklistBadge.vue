<script lang="ts" setup>
import type { Task } from "~/types";

const props = defineProps<{ task: Task }>();

const total = computed(() => props.task.checklist?.length ?? 0);
const done = computed(() => props.task.checklist?.filter((item) => item.done).length ?? 0);
const isComplete = computed(() => total.value > 0 && done.value === total.value);
</script>

<template>
	<span
		v-if="total"
		class="inline-flex shrink-0 items-center gap-1 font-mono text-xs tabular-nums"
		:class="isComplete ? 'text-success' : 'text-text-tertiary'"
		:title="`${done} of ${total} checklist items complete`"
	>
		<Icon :name="isComplete ? 'lucide:check-square-2' : 'lucide:square-check-big'" :size="12" />
		{{ done }}/{{ total }}
	</span>
</template>
