<script lang="ts" setup>
import { CalendarCell, type CalendarCellProps, useForwardProps } from "reka-ui";
import { computed, type HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<CalendarCellProps & { class?: HTMLAttributes["class"] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
	<CalendarCell
		data-slot="calendar-cell"
		:class="cn('[&:has([data-selected])]:bg-accent relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([data-selected])]:rounded-md', props.class)"
		v-bind="forwardedProps"
	>
		<slot />
	</CalendarCell>
</template>
