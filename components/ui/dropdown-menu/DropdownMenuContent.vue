<script setup lang="ts">
import { DropdownMenuContent, type DropdownMenuContentEmits, type DropdownMenuContentProps, DropdownMenuPortal, useForwardPropsEmits } from "reka-ui";
import { computed, type HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const { sideOffset = 4, ...props } = defineProps<DropdownMenuContentProps & { class?: HTMLAttributes["class"] }>();
const emits = defineEmits<DropdownMenuContentEmits>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return { ...delegated, sideOffset };
});

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
	<DropdownMenuPortal>
		<DropdownMenuContent
			data-slot="dropdown-menu-content"
			v-bind="forwarded"
			:class="
				cn(
					'bg-popover text-popover-foreground border-border data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1 z-50 max-h-(--reka-dropdown-menu-content-available-height) min-w-[10rem] origin-(--reka-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-none border p-1 shadow-sm',
					props.class
				)
			"
		>
			<slot />
		</DropdownMenuContent>
	</DropdownMenuPortal>
</template>
