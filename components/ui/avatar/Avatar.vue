<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { AvatarRoot } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps<{
	class?: HTMLAttributes["class"];
}>();
</script>

<template>
	<AvatarRoot data-slot="avatar" :class="cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', props.class)">
		<slot />
		<span aria-hidden="true" class="avatar-image-outline pointer-events-none absolute inset-0 rounded-[inherit]" />
	</AvatarRoot>
</template>

<style scoped>
.avatar-image-outline {
	box-shadow: inset 0 0 0 1px oklch(0 0 0 / 0.1);
}
</style>
