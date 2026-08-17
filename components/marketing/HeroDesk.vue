<script setup lang="ts">
/*
 * The hero composition: the note someone scribbled, the task it became, and the
 * moment it landed on somebody's plate. The satellites sit slightly off-axis
 * and drift a few pixels with the pointer, so the page feels like a desk rather
 * than a slide.
 */
const stage = ref<HTMLElement | null>(null);
const reducedMotion = usePreferredReducedMotion();
const { elementX, elementY, elementWidth, elementHeight, isOutside } = useMouseInElement(stage);

const drift = computed(() => {
	if (reducedMotion.value === "reduce" || isOutside.value || !elementWidth.value || !elementHeight.value) return { x: 0, y: 0 };
	return {
		x: (elementX.value / elementWidth.value - 0.5) * 2,
		y: (elementY.value / elementHeight.value - 0.5) * 2,
	};
});
</script>

<template>
	<div ref="stage" class="desk" :style="{ '--drift-x': drift.x, '--drift-y': drift.y }">
		<figure class="note" aria-hidden="true">
			<span class="note__pin" />
			<p class="note__text">we should fix the empty states on mobile before launch</p>
			<p class="ledger-meta note__source">standup · 12 Aug</p>
		</figure>

		<div class="desk__record">
			<MarketingTaskRecord />
		</div>

		<aside class="toast" aria-hidden="true">
			<span class="toast__avatar">A</span>
			<div>
				<p class="toast__title">Ada assigned you a task</p>
				<p class="ledger-meta toast__meta">Empty states for the mobile task list · now</p>
			</div>
		</aside>
	</div>
</template>

<style scoped>
.desk {
	position: relative;
	text-align: start;
	width: min(100%, 46rem);
	margin-inline: auto;
}

.desk__record {
	position: relative;
	z-index: 2;
	border-radius: var(--radius-lg);
	box-shadow: var(--shadow-lg);
	animation: record-arrive 760ms var(--ease-out) 120ms both;
}

/*
 * Satellites: paper things resting near the record, not floating chrome. On
 * narrow screens the note sits above the card instead of beside it, because
 * the note is the point — it is the "we should" the record came from.
 */
.note {
	position: relative;
	z-index: 3;
	width: min(100%, 15rem);
	margin: 0 auto -1rem;
	padding: 1.65rem 1.35rem 1.2rem;
	background: var(--note-paper);
	border-radius: 2px;
	box-shadow: var(--shadow-md);
	transform: rotate(-3deg);
	animation: satellite-arrive 700ms var(--ease-out) 340ms both;
}

.toast {
	position: absolute;
	z-index: 3;
	display: none;
}

/* Beside the record only when there is real room for it. */
@media (min-width: 1280px) {
	.note {
		position: absolute;
		top: -3.25rem;
		left: -13.25rem;
		width: 14.5rem;
		margin: 0;
		transform: rotate(-4deg) translate3d(calc(var(--drift-x) * 10px), calc(var(--drift-y) * 10px), 0);
		transition: transform var(--duration-slow) var(--ease-out);
	}
}

.note__pin {
	position: absolute;
	top: 0.6rem;
	left: 50%;
	width: 0.6rem;
	height: 0.6rem;
	background: var(--color-signal);
	border-radius: var(--radius-full);
	box-shadow: 0 2px 4px oklch(0.18 0.01 85 / 0.35);
	transform: translateX(-50%);
}

.note__text {
	font-size: 1rem;
	font-weight: 500;
	line-height: 1.5;
	letter-spacing: -0.01em;
	text-wrap: pretty;
}

.note__source {
	margin-top: 0.75rem;
}

.toast {
	right: -11rem;
	bottom: 1.25rem;
	width: 17.5rem;
	padding: 0.85rem 1rem;
	background: var(--color-surface-0);
	border: 1px solid var(--rule);
	border-radius: var(--radius-md);
	box-shadow: var(--shadow-md);
	transform: rotate(1.8deg) translate3d(calc(var(--drift-x) * -14px), calc(var(--drift-y) * -14px), 0);
	transition: transform var(--duration-slow) var(--ease-out);
	animation: satellite-arrive 700ms var(--ease-out) 540ms both;
}

@media (min-width: 1280px) {
	.toast {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: 0.7rem;
		align-items: center;
	}
}

.toast__avatar {
	display: grid;
	place-items: center;
	width: 1.75rem;
	height: 1.75rem;
	color: var(--color-text-secondary);
	background: var(--color-surface-2);
	border-radius: var(--radius-full);
	font-size: 0.6875rem;
	font-weight: 600;
}

.toast__title {
	font-size: 0.8125rem;
	font-weight: 560;
}

.toast__meta {
	margin-top: 0.2rem;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

@keyframes record-arrive {
	from {
		opacity: 0;
		filter: blur(8px);
		transform: translateY(22px);
	}

	to {
		opacity: 1;
		filter: blur(0);
		transform: none;
	}
}

/*
 * Satellites animate opacity only: their transform carries the pointer drift,
 * so a transform keyframe would freeze them in place once it finished.
 */
@keyframes satellite-arrive {
	from {
		opacity: 0;
		filter: blur(8px);
	}

	to {
		opacity: 1;
		filter: blur(0);
	}
}

@media (prefers-reduced-motion: reduce) {
	.desk__record,
	.note,
	.toast {
		animation: none;
	}
}
</style>
