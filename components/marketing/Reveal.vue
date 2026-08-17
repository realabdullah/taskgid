<script setup lang="ts">
const props = withDefaults(defineProps<{ delay?: number; as?: string }>(), { delay: 0, as: "div" });

const root = ref<HTMLElement | null>(null);
const isVisible = ref(false);
const reducedMotion = usePreferredReducedMotion();

const { stop } = useIntersectionObserver(
	root,
	([entry]) => {
		if (!entry?.isIntersecting) return;
		isVisible.value = true;
		stop();
	},
	{ rootMargin: "0px 0px -10%" }
);

onMounted(() => {
	if (reducedMotion.value === "reduce") isVisible.value = true;
});
</script>

<template>
	<component :is="props.as" ref="root" class="reveal" :class="{ 'is-visible': isVisible }" :style="{ '--reveal-delay': `${props.delay}ms` }">
		<slot />
	</component>
</template>

<style scoped>
.reveal {
	opacity: 0;
	filter: blur(6px);
	transform: translateY(14px);
	transition:
		opacity 620ms var(--ease-out) var(--reveal-delay),
		filter 620ms var(--ease-out) var(--reveal-delay),
		transform 620ms var(--ease-out) var(--reveal-delay);
}

.reveal.is-visible {
	opacity: 1;
	filter: blur(0);
	transform: none;
}

@media (prefers-reduced-motion: reduce) {
	.reveal,
	.reveal.is-visible {
		opacity: 1;
		filter: none;
		transform: none;
		transition: none;
	}
}
</style>
