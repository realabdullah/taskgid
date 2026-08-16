<script setup lang="ts">
import { computed, type HTMLAttributes } from "vue";
import { X } from "lucide-vue-next";
import { DialogClose, DialogContent, type DialogContentEmits, type DialogContentProps, DialogPortal, useForwardPropsEmits } from "reka-ui";
import SheetOverlay from "./SheetOverlay.vue";
import { cn } from "@/lib/utils";

interface SheetContentProps extends DialogContentProps {
	class?: HTMLAttributes["class"];
	side?: "top" | "right" | "bottom" | "left";
	hideClose?: boolean;
}

defineOptions({
	inheritAttrs: false,
});

const props = withDefaults(defineProps<SheetContentProps>(), {
	side: "right",
	hideClose: false,
});
const emits = defineEmits<DialogContentEmits>();

const delegatedProps = computed(() => {
	const { class: _, side, ...delegated } = props;
	return delegated;
});

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
	<DialogPortal>
		<SheetOverlay />
		<DialogContent
			data-slot="sheet-content"
			:data-side="props.side"
			:class="
				cn(
					'sheet-content bg-background fixed z-50 flex flex-col gap-4 overflow-hidden shadow-lg',
					props.side === 'right' && 'inset-y-0 right-0 h-full w-3/4 rounded-s-xl border-l sm:max-w-sm',
					props.side === 'left' && 'inset-y-0 left-0 h-full w-3/4 rounded-e-xl border-r sm:max-w-sm',
					props.side === 'top' && 'inset-x-0 top-0 h-auto rounded-b-xl border-b',
					props.side === 'bottom' && 'inset-x-0 bottom-0 h-auto rounded-t-xl border-t',
					props.class
				)
			"
			v-bind="{ ...forwarded, ...$attrs }"
			:force-mount="true"
		>
			<slot />

			<DialogClose
				v-if="!props.hideClose"
				class="ring-offset-background focus:ring-ring text-text-secondary hover:bg-surface-2 hover:text-text-primary absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
			>
				<X class="size-[18px]" />
				<span class="sr-only">Close</span>
			</DialogClose>
		</DialogContent>
	</DialogPortal>
</template>

<style>
.sheet-content {
	opacity: 1;
	pointer-events: auto;
	transform: translate3d(0, 0, 0);
	visibility: visible;
	transition-property: transform, opacity, visibility;
	transition-duration: 200ms, 200ms, 0ms;
	transition-delay: 0ms;
	transition-timing-function: var(--ease-out);
}

.sheet-content[data-state="closed"] {
	opacity: 0;
	pointer-events: none;
	visibility: hidden;
	transition-duration: 150ms, 150ms, 0ms;
	transition-delay: 0ms, 0ms, 150ms;
}

.sheet-content[data-side="right"][data-state="closed"] {
	transform: translate3d(100%, 0, 0);
}

.sheet-content[data-side="left"][data-state="closed"] {
	transform: translate3d(-100%, 0, 0);
}

.sheet-content[data-side="top"][data-state="closed"] {
	transform: translate3d(0, -100%, 0);
}

.sheet-content[data-side="bottom"][data-state="closed"] {
	transform: translate3d(0, 100%, 0);
}

@starting-style {
	.sheet-content[data-side="right"][data-state="open"] {
		opacity: 0;
		transform: translate3d(100%, 0, 0);
	}

	.sheet-content[data-side="left"][data-state="open"] {
		opacity: 0;
		transform: translate3d(-100%, 0, 0);
	}

	.sheet-content[data-side="top"][data-state="open"] {
		opacity: 0;
		transform: translate3d(0, -100%, 0);
	}

	.sheet-content[data-side="bottom"][data-state="open"] {
		opacity: 0;
		transform: translate3d(0, 100%, 0);
	}
}

@media (prefers-reduced-motion: reduce) {
	.sheet-content {
		transition-duration: 0ms, 0ms, 0ms;
		transition-delay: 0ms;
	}
}
</style>
