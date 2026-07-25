<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { ChevronDown } from "lucide-vue-next";
import { SelectIcon, SelectTrigger, type SelectTriggerProps, useForwardProps } from "reka-ui";
import { cn } from "@/lib/utils";

const { size = "default", ...props } = defineProps<SelectTriggerProps & { class?: HTMLAttributes["class"]; size?: "sm" | "default" }>();

const delegatedProps = reactiveOmit(props, "class");
const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
	<SelectTrigger
		data-slot="select-trigger"
		:data-size="size"
		v-bind="forwardedProps"
		:class="
			cn(
				`border-border data-[placeholder]:text-text-tertiary [&_svg:not([class*='text-'])]:text-text-tertiary focus-visible:border-primary focus-visible:ring-primary/20 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-surface-0 flex w-fit items-center justify-between gap-2 rounded-none border px-3 py-2 text-left text-sm whitespace-nowrap shadow-none transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-10 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:flex-1 *:data-[slot=select-value]:items-center *:data-[slot=select-value]:text-left [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
				props.class
			)
		"
	>
		<slot />
		<SelectIcon as-child>
			<ChevronDown class="size-4 opacity-50" />
		</SelectIcon>
	</SelectTrigger>
</template>
