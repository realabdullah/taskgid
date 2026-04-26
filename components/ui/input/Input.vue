<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { useVModel } from "@vueuse/core";
import { cn } from "@/lib/utils";

const props = defineProps<{
	defaultValue?: string | number;
	modelValue?: string | number;
	class?: HTMLAttributes["class"];
}>();

const emits = defineEmits<{
	(e: "update:modelValue", payload: string | number): void;
}>();

const modelValue = useVModel(props, "modelValue", emits, {
	passive: true,
	defaultValue: props.defaultValue,
});
</script>

<template>
	<input
		v-model="modelValue"
		data-slot="input"
		:class="
			cn(
				'interactive file:text-text-primary placeholder:text-text-tertiary selection:bg-primary border-border bg-surface-0 flex h-9 w-full min-w-0 rounded-md border px-3 text-base leading-none shadow-xs selection:text-white file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
				'focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-1',
				'aria-invalid:border-danger aria-invalid:ring-danger/25 aria-invalid:ring-2',
				props.class
			)
		"
	/>
</template>
