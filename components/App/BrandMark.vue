<script setup lang="ts">
withDefaults(
	defineProps<{
		size?: "sm" | "md" | "lg";
		showName?: boolean;
		inverted?: boolean;
	}>(),
	{ size: "md", showName: false, inverted: false }
);
</script>

<template>
	<div class="inline-flex items-center gap-2" :class="{ 'text-rail-foreground': inverted }">
		<svg viewBox="0 0 64 64" aria-hidden="true" class="shrink-0" :class="{ 'h-7 w-7': size === 'sm', 'h-9 w-9': size === 'md', 'h-12 w-12': size === 'lg' }">
			<path d="M45 17.5A20 20 0 1 0 49 38H32V29h22v9c-2.5 12-11.3 18-22 18C17.6 56 8 46.4 8 32S17.6 8 32 8c6.6 0 12.3 2.2 16.1 6.1L45 17.5Z" fill="currentColor" />
			<path d="M41 34h13v13H41z" fill="var(--color-signal)" />
		</svg>
		<span v-if="showName" class="brand-wordmark">Taskgid</span>
	</div>
</template>
