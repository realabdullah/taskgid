<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { useVModel } from "@vueuse/core";
import { cn } from "@/lib/utils";

const props = defineProps<{
	class?: HTMLAttributes["class"];
	defaultValue?: string | number;
	modelValue?: string | number;
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
	<textarea
		v-model="modelValue"
		data-slot="textarea"
		:class="
			cn(
				'border-border placeholder:text-text-tertiary focus-visible:border-primary aria-invalid:ring-danger/20 aria-invalid:border-danger bg-surface-0 text-md flex field-sizing-content min-h-16 w-full rounded-sm border px-3 py-2 shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-base',
				props.class
			)
		"
	/>
</template>
