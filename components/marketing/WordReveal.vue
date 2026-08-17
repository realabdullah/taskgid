<script setup lang="ts">
/*
 * The headline arrives one word at a time, out of focus and settling — the way
 * a thought does. Everything is legible immediately if motion is turned off.
 */
const props = withDefaults(defineProps<{ text: string; delay?: number; stagger?: number }>(), { delay: 0, stagger: 70 });

const words = computed(() => props.text.split(" "));
</script>

<template>
	<span class="words">
		<span v-for="(word, index) in words" :key="`${word}-${index}`" class="words__word" :style="{ animationDelay: `${props.delay + index * props.stagger}ms` }">{{ word }}&nbsp;</span>
	</span>
</template>

<style scoped>
.words {
	display: inline;
}

.words__word {
	display: inline-block;
	animation: word-settle 720ms var(--ease-out) both;
}

@keyframes word-settle {
	from {
		opacity: 0;
		filter: blur(10px);
		transform: translateY(0.18em);
	}

	to {
		opacity: 1;
		filter: blur(0);
		transform: none;
	}
}

@media (prefers-reduced-motion: reduce) {
	.words__word {
		animation: none;
	}
}
</style>
