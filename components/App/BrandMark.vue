<script setup lang="ts">
/*
 * The Taskgid mark: a T whose stem falls and kicks back up — the letter of the
 * name and the stroke that closes a task. The closing stroke carries the only
 * colour, so the brand's accent always means the same thing it means in the
 * product. `tone` picks the palette; the wordmark is live Geist text, never an
 * image, so it stays crisp and selectable.
 */
withDefaults(
	defineProps<{
		size?: "xs" | "sm" | "md" | "lg";
		showName?: boolean;
		/** "brand" ink + signal, "mono" one colour, "inverted" for ink backgrounds. */
		tone?: "brand" | "mono" | "inverted";
		/** @deprecated pass `tone="inverted"` instead. */
		inverted?: boolean;
	}>(),
	{ size: "md", showName: false, tone: "brand", inverted: false }
);
</script>

<template>
	<div class="brand" :class="[`brand--${size}`, { 'text-rail-foreground': tone === 'inverted' || inverted }]">
		<svg viewBox="0 0 32 32" class="brand__mark" aria-hidden="true" fill="none" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round">
			<path d="M6 6H26M16 6V26" stroke="currentColor" />
			<path d="M16 26L26 16" :stroke="tone === 'mono' ? 'currentColor' : 'var(--color-signal)'" />
		</svg>
		<span v-if="showName" class="brand-wordmark">Taskgid</span>
	</div>
</template>

<style scoped>
.brand {
	display: inline-flex;
	align-items: center;
}

/* The mark stands a third taller than the caps beside it, with a fixed gap. */
.brand--xs {
	gap: 0.375rem;
	font-size: 0.9375rem;
}

.brand--sm {
	gap: 0.5rem;
	font-size: 1.0625rem;
}

.brand--md {
	gap: 0.625rem;
	font-size: 1.375rem;
}

.brand--lg {
	gap: 0.875rem;
	font-size: 1.875rem;
}

.brand__mark {
	flex-shrink: 0;
	width: 1.34em;
	height: 1.34em;
}

.brand-wordmark {
	font-size: 1em;
}
</style>
