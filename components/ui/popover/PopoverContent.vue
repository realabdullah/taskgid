<script setup lang="ts">
import { PopoverContent, type PopoverContentEmits, type PopoverContentProps, PopoverPortal, useForwardPropsEmits } from "reka-ui";
import { computed, type HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

defineOptions({
	inheritAttrs: false,
});

/*
 * `avoidCollisions` + `collisionPadding` keep the panel inside the viewport, and
 * `--reka-popover-content-available-height` caps it so a tall popover scrolls
 * internally instead of running off the top or bottom of the screen.
 */
const { align = "center", sideOffset = 4, avoidCollisions = true, collisionPadding = 12, ...props } = defineProps<PopoverContentProps & { class?: HTMLAttributes["class"] }>();
const emits = defineEmits<PopoverContentEmits>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return { ...delegated, align, sideOffset, avoidCollisions, collisionPadding };
});

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
	<PopoverPortal>
		<PopoverContent
			data-slot="popover-content"
			v-bind="{ ...forwarded, ...$attrs }"
			:class="
				cn(
					'bg-popover text-popover-foreground border-border data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1 z-50 flex max-h-(--reka-popover-content-available-height) w-72 origin-(--reka-popover-content-transform-origin) flex-col overflow-hidden rounded-lg border p-3 shadow-md outline-hidden',
					props.class
				)
			"
		>
			<slot />
		</PopoverContent>
	</PopoverPortal>
</template>
