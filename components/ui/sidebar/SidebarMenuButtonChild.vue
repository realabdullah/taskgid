<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { Primitive, type PrimitiveProps } from "reka-ui";
import { type SidebarMenuButtonVariants, sidebarMenuButtonVariants } from ".";
import { cn } from "@/lib/utils";

export interface SidebarMenuButtonProps extends PrimitiveProps {
	variant?: SidebarMenuButtonVariants["variant"];
	size?: SidebarMenuButtonVariants["size"];
	isActive?: boolean;
	class?: HTMLAttributes["class"];
}

const { as = "button", variant = "default", size = "default", ...props } = defineProps<SidebarMenuButtonProps>();
</script>

<template>
	<Primitive
		data-slot="sidebar-menu-button"
		data-sidebar="menu-button"
		:data-size="size"
		:data-active="props.isActive"
		:class="cn(sidebarMenuButtonVariants({ variant, size }), props.class)"
		:as="as"
		:as-child="props.asChild"
		v-bind="$attrs"
	>
		<slot />
	</Primitive>
</template>
