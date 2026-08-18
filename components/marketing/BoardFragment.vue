<script setup lang="ts">
/*
 * The board view at a glance: three columns, a few cards, the same status
 * colours the app uses. Small enough to read as an object on the page rather
 * than a screenshot of one.
 */
const columns = [
	{ label: "To do", tone: "todo", cards: ["Audit the settings copy", "Timezones on due dates"] },
	{ label: "In progress", tone: "progress", cards: ["Empty states on mobile", "Invite flow polish", "Board drag targets"] },
	{ label: "Done", tone: "done", cards: ["Passkey sign-in"] },
];
</script>

<template>
	<div class="board" aria-hidden="true">
		<div v-for="column in columns" :key="column.label" class="board__column">
			<p class="ledger-meta board__label"><span class="board__dot" :data-tone="column.tone" />{{ column.label }}</p>
			<p v-for="card in column.cards" :key="card" class="board__card">{{ card }}</p>
		</div>
	</div>
</template>

<style scoped>
.board {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 0.5rem;
	padding: 0.75rem;
	background: var(--color-surface-0);
	border: 1px solid var(--rule);
	border-radius: var(--radius-md);
	box-shadow: var(--shadow-xs);
	transform: rotate(-0.8deg);
	transition:
		transform var(--duration-normal) var(--ease-out),
		box-shadow var(--duration-normal) var(--ease-out);
}

.board:hover {
	box-shadow: var(--shadow-sm);
	transform: rotate(0deg) translateY(-2px);
}

.board__column {
	display: grid;
	align-content: start;
	gap: 0.35rem;
}

.board__label {
	display: flex;
	align-items: center;
	gap: 0.3rem;
	margin-bottom: 0.15rem;
}

.board__dot {
	width: 0.375rem;
	height: 0.375rem;
	border-radius: var(--radius-full);
}

.board__dot[data-tone="todo"] {
	background: var(--color-status-todo);
}

.board__dot[data-tone="progress"] {
	background: var(--color-status-in-progress);
}

.board__dot[data-tone="done"] {
	background: var(--color-status-done);
}

.board__card {
	padding: 0.4rem 0.5rem;
	color: var(--color-text-secondary);
	background: var(--color-surface-1);
	border: 1px solid var(--rule);
	border-radius: var(--radius-xs);
	font-size: 0.6875rem;
	line-height: 1.35;
}
</style>
