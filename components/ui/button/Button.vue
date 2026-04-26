<script setup lang="ts">
import { cn } from "@/lib/utils";
import { Primitive, type PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { type ButtonVariants, buttonVariants } from ".";

interface Props extends PrimitiveProps {
	variant?: ButtonVariants["variant"];
	size?: ButtonVariants["size"];
	loading?: boolean;
	loadingLabel?: string;
	minWidth?: string;
	class?: HTMLAttributes["class"];
	disabled?: boolean;
}

const { as = "button", loading = false, loadingLabel = "Loading", ...props } = defineProps<Props>();
</script>

<template>
	<Primitive
		data-slot="button"
		:as="as"
		:as-child="props.asChild"
		:disabled="loading || props.disabled"
		:aria-busy="loading"
		:class="cn(buttonVariants({ variant, size }), props.class)"
		:style="loading && props.minWidth ? { '--btn-min-w': props.minWidth, minWidth: 'var(--btn-min-w)' } : undefined"
	>
		<template v-if="loading">
			<Icon name="lucide:loader-circle" class="h-4 w-4 animate-spin" />
			<span class="inline-flex items-center justify-center">{{ loadingLabel }}</span>
		</template>
		<span v-else class="inline-flex items-center justify-center gap-2"><slot /></span>
	</Primitive>
</template>
