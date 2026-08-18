<script setup lang="ts">
/*
 * The hero's only illustration: one task, drawn the way the product draws it.
 * No floating cards, no glow — the argument is that the whole history sits on
 * the task, so the picture has to be the task.
 */
const fields = [
	{ label: "Status", value: "In progress", kind: "status" },
	{ label: "Priority", value: "High", kind: "priority" },
	{ label: "Due", value: "20 Aug", kind: "plain" },
];

const entries = [
	{ time: "12 Aug 09:14", actor: "Ada", event: "created this task in Product" },
	{ time: "12 Aug 09:15", actor: "Ada", event: "set priority to High" },
	{ time: "13 Aug 11:02", actor: "Ada", event: "assigned Kola" },
	{ time: "14 Aug 16:40", actor: "Kola", event: "moved it to In progress" },
];
</script>

<template>
	<article class="record" aria-label="Example task in Taskgid">
		<header class="record__head">
			<span class="ledger-meta">Product · Task</span>
			<p class="record__title">Empty states for the mobile task list</p>

			<dl class="record__fields">
				<div v-for="field in fields" :key="field.label" class="record__field">
					<dt class="ledger-meta">{{ field.label }}</dt>
					<dd class="record__value">
						<template v-if="field.kind === 'status'">
							<Icon name="hugeicons:clock-01" :size="14" class="record__status-icon" />
							{{ field.value }}
						</template>
						<span v-else-if="field.kind === 'priority'" class="record__badge">{{ field.value }}</span>
						<template v-else>{{ field.value }}</template>
					</dd>
				</div>
				<div class="record__field">
					<dt class="ledger-meta">Assignees</dt>
					<dd class="record__value record__value--people">
						<span class="record__avatar">AO</span>
						<span class="record__avatar">KM</span>
					</dd>
				</div>
			</dl>
		</header>

		<div class="record__log">
			<p class="ledger-meta record__log-label">Activity</p>
			<ol class="record__entries">
				<li v-for="(entry, index) in entries" :key="entry.time" class="record__entry" :style="{ '--entry-index': index }">
					<span class="ledger-meta record__time">{{ entry.time }}</span>
					<span class="record__event"
						><span class="record__actor">{{ entry.actor }}</span> {{ entry.event }}</span
					>
				</li>
			</ol>

			<div class="record__comment" :style="{ '--entry-index': entries.length }">
				<span class="ledger-meta record__time">15 Aug 08:26</span>
				<div>
					<p class="record__event"><span class="record__actor">Kola</span> commented</p>
					<p class="record__quote">Copy is the blocker. <span class="record__mention">@ada</span> can you confirm the line for an empty list?</p>
				</div>
			</div>
		</div>
	</article>
</template>

<style scoped>
.record {
	text-align: start;
	background: var(--color-surface-0);
	border: 1px solid var(--rule);
	border-radius: var(--radius-lg);
}

.record__head {
	padding: 1.5rem 1.5rem 1.25rem;
	border-bottom: 1px solid var(--rule);
}

.record__title {
	margin-top: 0.5rem;
	font-size: 1.1875rem;
	font-weight: 600;
	letter-spacing: -0.02em;
	line-height: 1.3;
}

.record__fields {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 0.9rem 1.5rem;
	margin-top: 1.35rem;
}

@media (min-width: 480px) {
	.record__fields {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}
}

.record__field dt {
	display: block;
	margin-bottom: 0.35rem;
}

.record__value {
	display: flex;
	align-items: center;
	gap: 0.4rem;
	font-size: 0.8125rem;
	font-weight: 500;
}

.record__value--people {
	gap: 0.3rem;
}

/*
 * The card's entire colour budget, drawn the way the app draws it: a tinted
 * status icon and a tinted priority badge. Nothing else here is coloured.
 */
.record__status-icon {
	color: var(--color-status-in-progress);
}

.record__badge {
	padding: 0.15rem 0.45rem;
	color: var(--color-priority-high);
	background: color-mix(in srgb, var(--color-priority-high) 10%, transparent);
	border-radius: var(--radius-xs);
	font-size: 0.71875rem;
	font-weight: 600;
}

.record__avatar {
	display: grid;
	place-items: center;
	width: 1.5rem;
	height: 1.5rem;
	color: var(--color-text-secondary);
	background: var(--color-surface-2);
	border-radius: var(--radius-full);
	font-size: 0.5625rem;
	font-weight: 600;
	letter-spacing: 0.02em;
}

.record__log {
	padding: 1.25rem 1.5rem 1.5rem;
}

.record__log-label {
	margin-bottom: 0.9rem;
}

.record__entries {
	display: grid;
	gap: 0.7rem;
}

.record__entry,
.record__comment {
	display: grid;
	grid-template-columns: 5.75rem minmax(0, 1fr);
	gap: 0.85rem;
	align-items: baseline;
	animation: record-enter 420ms var(--ease-out) both;
	animation-delay: calc(220ms + var(--entry-index) * 90ms);
}

.record__comment {
	margin-top: 0.9rem;
	padding-top: 0.9rem;
	border-top: 1px solid var(--rule);
}

.record__time {
	padding-top: 0.05rem;
}

.record__event {
	color: var(--color-text-secondary);
	font-size: 0.8125rem;
	line-height: 1.5;
}

.record__actor {
	color: var(--color-text-primary);
	font-weight: 560;
}

.record__quote {
	margin-top: 0.35rem;
	color: var(--color-text-primary);
	font-size: 0.8125rem;
	line-height: 1.55;
}

.record__mention {
	color: var(--color-accent-text);
	font-weight: 560;
}

@keyframes record-enter {
	from {
		opacity: 0;
		transform: translateY(6px);
	}

	to {
		opacity: 1;
		transform: none;
	}
}

@media (prefers-reduced-motion: reduce) {
	.record__entry,
	.record__comment {
		animation: none;
	}
}
</style>
