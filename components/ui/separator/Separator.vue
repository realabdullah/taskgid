<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { Separator, type SeparatorProps } from "reka-ui";
import { computed } from "vue";
import { cn } from "@/lib/utils";

const { orientation = "horizontal", decorative = true, ...props } = defineProps<SeparatorProps & { class?: HTMLAttributes["class"] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;
	return { ...delegated, orientation, decorative };
});
</script>

<template>
	<Separator
		data-slot="separator-root"
		v-bind="delegatedProps"
		:class="cn(`bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px`, props.class)"
	/>
</template>
