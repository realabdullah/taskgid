<script setup lang="ts">
/*
 * A small, real fragment of the product for each beat of the story. These are
 * the parts you would actually touch — a field being typed into, the status
 * pills, a comment, a notification — drawn at the size they appear in the app
 * and tipped a degree or two so the page has a hand in it.
 */
const props = defineProps<{ kind: "capture" | "assign" | "discuss" | "move" | "notice" | "close" }>();
</script>

<template>
	<div class="artifact" :data-kind="props.kind">
		<template v-if="props.kind === 'capture'">
			<p class="ledger-meta artifact__label">New task</p>
			<p class="artifact__typing">Empty states on mobile<span class="artifact__caret" /></p>
		</template>

		<template v-else-if="props.kind === 'assign'">
			<div class="artifact__chips">
				<span class="chip"><span class="chip__avatar">KM</span>Kola</span>
				<span class="chip"><span class="chip__dot" data-tone="high" />High</span>
				<span class="chip">20 Aug</span>
			</div>
		</template>

		<template v-else-if="props.kind === 'discuss'">
			<p class="artifact__comment">Copy is the blocker. <span class="artifact__mention">@ada</span> can you confirm the line?</p>
			<p class="ledger-meta artifact__label artifact__label--after">Kola · 2 replies</p>
		</template>

		<template v-else-if="props.kind === 'move'">
			<div class="artifact__pills">
				<span class="pill">To do</span>
				<span class="pill pill--active"><span class="chip__dot" data-tone="progress" />In progress</span>
				<span class="pill">Done</span>
			</div>
		</template>

		<template v-else-if="props.kind === 'notice'">
			<div class="artifact__notice">
				<span class="artifact__bell"><Icon name="lucide:bell" :size="13" /></span>
				<span>
					<span class="artifact__notice-title">Assigned to you</span>
					<span class="ledger-meta artifact__label artifact__label--after">2 minutes ago</span>
				</span>
			</div>
		</template>

		<template v-else>
			<div class="artifact__done">
				<span class="artifact__check"><Icon name="lucide:check" :size="13" /></span>
				<span class="artifact__done-text">Done · 15 Aug</span>
			</div>
			<p class="ledger-meta artifact__label artifact__label--after">9 finished this week</p>
		</template>
	</div>
</template>

<style scoped>
.artifact {
	padding: 0.85rem 0.95rem;
	background: var(--color-surface-0);
	border: 1px solid var(--rule);
	border-radius: var(--radius-md);
	box-shadow: var(--shadow-xs);
	transform: rotate(var(--tilt, -0.8deg));
	transition:
		transform var(--duration-normal) var(--ease-out),
		box-shadow var(--duration-normal) var(--ease-out);
}

.artifact[data-kind="assign"],
.artifact[data-kind="move"] {
	--tilt: 0.7deg;
}

.artifact[data-kind="notice"] {
	--tilt: 1deg;
}

/* Picked up slightly when the reader is in this row. */
.beat:hover .artifact {
	box-shadow: var(--shadow-sm);
	transform: rotate(0deg) translateY(-2px);
}

.artifact__label {
	display: block;
}

.artifact__label--after {
	margin-top: 0.4rem;
}

.artifact__typing {
	margin-top: 0.4rem;
	text-wrap: pretty;
	font-size: 0.8125rem;
	font-weight: 500;
	line-height: 1.4;
}

.artifact__caret {
	display: inline-block;
	width: 1px;
	height: 0.95em;
	margin-left: 2px;
	vertical-align: text-bottom;
	background: var(--color-ink);
	animation: caret-blink 1.1s steps(1) infinite;
}

.artifact__chips,
.artifact__pills {
	display: flex;
	flex-wrap: wrap;
	gap: 0.35rem;
}

.chip,
.pill {
	display: inline-flex;
	align-items: center;
	gap: 0.35rem;
	padding: 0.25rem 0.5rem;
	color: var(--color-text-secondary);
	background: var(--color-surface-2);
	border-radius: var(--radius-xs);
	font-size: 0.71875rem;
	font-weight: 500;
}

.chip__avatar {
	display: grid;
	place-items: center;
	width: 1.05rem;
	height: 1.05rem;
	color: var(--color-text-secondary);
	background: var(--color-surface-3);
	border-radius: var(--radius-full);
	font-size: 0.5rem;
	font-weight: 600;
}

.chip__dot {
	width: 0.375rem;
	height: 0.375rem;
	border-radius: var(--radius-full);
}

.chip__dot[data-tone="high"] {
	background: var(--color-priority-high);
}

.chip__dot[data-tone="progress"] {
	background: var(--color-status-in-progress);
}

.pill {
	background: transparent;
	border: 1px solid var(--rule);
}

.pill--active {
	color: var(--color-status-in-progress);
	background: var(--color-status-in-progress-bg);
	border-color: transparent;
}

.artifact__comment {
	font-size: 0.8125rem;
	line-height: 1.5;
	text-wrap: pretty;
}

.artifact__mention {
	color: var(--color-accent-text);
	font-weight: 560;
}

.artifact__notice,
.artifact__done {
	display: flex;
	align-items: center;
	gap: 0.55rem;
}

.artifact__bell,
.artifact__check {
	display: grid;
	place-items: center;
	width: 1.5rem;
	height: 1.5rem;
	border-radius: var(--radius-xs);
}

.artifact__bell {
	color: var(--color-status-in-review);
	background: var(--color-status-in-review-bg);
}

.artifact__check {
	color: var(--color-status-done);
	background: var(--color-status-done-bg);
}

.artifact__notice-title,
.artifact__done-text {
	display: block;
	font-size: 0.8125rem;
	font-weight: 560;
}

@keyframes caret-blink {
	50% {
		opacity: 0;
	}
}

@media (prefers-reduced-motion: reduce) {
	.artifact__caret {
		animation: none;
	}
}
</style>
