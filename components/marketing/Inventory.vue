<script setup lang="ts">
/*
 * A plain inventory, not a feature grid. Every line is a thing the product
 * actually does today.
 */
const groups = [
	{
		label: "On a task",
		items: [
			"Title and a written description",
			"To do, In progress, Done",
			"Low, medium and high priority",
			"Due dates",
			"One or more assignees",
			"Comments, replies and @mentions",
			"An activity timeline of every change",
		],
	},
	{
		label: "Around a team",
		items: ["Separate workspaces per project or team", "Invite by email, with roles", "A member directory", "Workspace statistics", "Notifications for assignment, mentions and your own queue"],
	},
	{
		label: "Getting around",
		items: [
			"A command palette for search and navigation",
			"Filters by status, priority and assignee",
			"List view and board view",
			"A dashboard that opens on your queue",
			"Recent tasks, wherever you left them",
		],
	},
	{
		label: "Signing in",
		items: ["Passkeys", "Email and password", "A two-step setup, then you are in"],
	},
];
</script>

<template>
	<section id="inside" class="inventory">
		<div class="ledger-container">
			<MarketingReveal as="header" class="inventory__head">
				<div>
					<p class="ledger-meta">What’s inside</p>
					<h2 class="ledger-title mt-4 max-w-[22ch]">The whole product, listed plainly.</h2>
					<p class="ledger-prose mt-4 text-[0.9375rem]">Taskgid is small on purpose. Here is everything in it, so you can decide in a minute instead of a trial.</p>
				</div>
				<div class="inventory__board"><MarketingBoardFragment /></div>
			</MarketingReveal>

			<div class="inventory__grid">
				<MarketingReveal v-for="(group, index) in groups" :key="group.label" as="section" class="inventory__group" :delay="index * 90">
					<h3 class="ledger-meta inventory__label">{{ group.label }}</h3>
					<ul class="inventory__items">
						<li v-for="item in group.items" :key="item">{{ item }}</li>
					</ul>
				</MarketingReveal>
			</div>
		</div>
	</section>
</template>

<style scoped>
.inventory {
	padding-block: clamp(4rem, 8vw, 7rem);
	background: var(--color-canvas);
	border-top: 1px solid var(--rule);
}

.inventory__head {
	display: grid;
	gap: 2.5rem;
	margin-bottom: clamp(2.5rem, 5vw, 3.5rem);
}

@media (min-width: 900px) {
	.inventory__head {
		grid-template-columns: minmax(0, var(--measure)) minmax(0, 1fr);
		gap: clamp(2.5rem, 6vw, 5rem);
		align-items: center;
	}
}

.inventory__board {
	width: min(100%, 27rem);
}

.inventory__grid {
	display: grid;
	gap: 2.5rem 3rem;
}

@media (min-width: 640px) {
	.inventory__grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@media (min-width: 1024px) {
	.inventory__grid {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}
}

.inventory__label {
	padding-bottom: 0.75rem;
	border-bottom: 1px solid var(--rule-strong);
}

.inventory__items {
	display: grid;
	gap: 0.65rem;
	margin-top: 0.9rem;
	font-size: 0.875rem;
	line-height: 1.45;
}

.inventory__items li {
	color: var(--color-text-secondary);
	text-wrap: pretty;
	transition: color var(--duration-fast) var(--ease-out);
}

.inventory__items li:hover {
	color: var(--color-text-primary);
}
</style>
