<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

interface SkeletonProps {
	class?: HTMLAttributes["class"];
}

const props = defineProps<SkeletonProps>();
</script>

<template>
	<div
		data-slot="skeleton"
		:class="
			cn(
				'bg-surface-2 before:bg-surface-3 relative overflow-hidden before:absolute before:inset-y-0 before:left-0 before:w-1/3 before:animate-[taskgid-sweep_1.2s_var(--ease-out)_infinite] before:opacity-40',
				props.class
			)
		"
	/>
</template>

<style>
@keyframes taskgid-sweep {
	from {
		transform: translateX(-120%);
	}
	to {
		transform: translateX(420%);
	}
}
@media (prefers-reduced-motion: reduce) {
	[data-slot="skeleton"]::before {
		animation: none !important;
	}
}
</style>
