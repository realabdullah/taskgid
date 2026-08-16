<script setup lang="ts" generic="T extends string | number">
import type { HTMLAttributes } from "vue";
import type { SegmentedOption } from "./types";
import { cn } from "@/lib/utils";

const props = defineProps<{
	options: SegmentedOption<T>[];
	/** Accessible name for the group, e.g. "Filter your queue". */
	label: string;
	size?: "sm" | "md";
	class?: HTMLAttributes["class"];
}>();

const model = defineModel<T>({ required: true });

const sizeClass = computed(() => (props.size === "md" ? "h-8 px-3 text-sm" : "h-7 px-2.5 text-xs"));
</script>

<template>
	<div
		role="radiogroup"
		:aria-label="props.label"
		:class="cn('border-border bg-surface-2 no-scrollbar inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-md border p-1', props.class)"
	>
		<Pressable
			v-for="option in props.options"
			:key="String(option.value)"
			static
			role="radio"
			:aria-checked="model === option.value"
			:class="
				cn(
					'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xs font-medium whitespace-nowrap',
					sizeClass,
					model === option.value
						? 'bg-surface-0 text-text-primary ring-border-strong/70 shadow-xs ring-1'
						: 'text-text-secondary hover:bg-surface-0/60 hover:text-text-primary bg-transparent'
				)
			"
			@click="model = option.value"
		>
			<Icon v-if="option.icon" :name="option.icon" :size="14" />
			{{ option.label }}
			<span v-if="option.count !== undefined" class="text-text-tertiary tabular-nums">{{ option.count }}</span>
		</Pressable>
	</div>
</template>
