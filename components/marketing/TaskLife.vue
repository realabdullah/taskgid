<script setup lang="ts">
/*
 * The spine of the page: one task's life, read top to bottom. Each beat names
 * the moment first and the machinery second, so the page argues in the order
 * the work actually happens.
 */
const beats = [
	{
		index: "01",
		stage: "Someone says “we should”",
		claim: "It takes one line to file it properly.",
		body: "Add a task to a workspace from anywhere in the app. Nothing is required beyond a title, so the idea gets written down before the meeting moves on.",
		machinery: "Workspaces · quick add · command palette",
		kind: "capture" as const,
	},
	{
		index: "02",
		stage: "It gets an owner",
		claim: "A wish becomes a commitment.",
		body: "Assignees, a priority and a due date. Every task in a workspace can name who is holding it, so “someone should look at this” stops being a category of work.",
		machinery: "Assignees · priority · due dates",
		kind: "assign" as const,
	},
	{
		index: "03",
		stage: "People argue about it",
		claim: "The argument stays on the task.",
		body: "Comments, replies and @mentions sit under the description they are about. The reasoning does not end up in a chat thread nobody can find in a month.",
		machinery: "Comments · replies · mentions",
		kind: "discuss" as const,
	},
	{
		index: "04",
		stage: "It moves",
		claim: "Three states, no ceremony.",
		body: "To do, In progress, Done. Read them as a list or a board, filtered by status, priority or assignee when the workspace gets loud.",
		machinery: "List and board views · filters",
		kind: "move" as const,
	},
	{
		index: "05",
		stage: "The right people notice",
		claim: "You hear about your work, not everyone’s.",
		body: "Notifications fire on assignment, mentions and the things you are holding. The dashboard opens on your own queue rather than a wall of activity.",
		machinery: "Notifications · focus queue",
		kind: "notice" as const,
	},
	{
		index: "06",
		stage: "It closes",
		claim: "Done is still readable a month later.",
		body: "The timeline keeps who moved it, when and what was said on the way. Workspace statistics count the finished work without anyone assembling a report.",
		machinery: "Activity timeline · statistics",
		kind: "close" as const,
	},
];
</script>

<template>
	<section id="life" class="life">
		<div class="ledger-container">
			<MarketingReveal as="header" class="life__head">
				<p class="ledger-meta">How a task moves</p>
				<h2 class="ledger-title mt-4 max-w-[20ch]">Six moments between “we should” and done.</h2>
				<p class="ledger-prose mt-4 text-[0.9375rem]">The note from the standup becomes a task, an owner, an argument, a status, and finally a line you can still read months later.</p>
			</MarketingReveal>

			<ol class="life__list">
				<MarketingReveal v-for="beat in beats" :key="beat.index" as="li" class="beat">
					<div class="beat__rail">
						<span class="ledger-meta">{{ beat.index }}</span>
						<span class="beat__stage">{{ beat.stage }}</span>
					</div>
					<div class="beat__body">
						<h3 class="beat__claim">{{ beat.claim }}</h3>
						<p class="beat__text">{{ beat.body }}</p>
						<p class="ledger-meta beat__machinery">{{ beat.machinery }}</p>
					</div>
					<div class="beat__artifact">
						<MarketingBeatArtifact :kind="beat.kind" />
					</div>
				</MarketingReveal>
			</ol>
		</div>
	</section>
</template>

<style scoped>
.life {
	padding-block: clamp(4rem, 8vw, 7rem);
	border-top: 1px solid var(--rule);
}

.life__head {
	max-width: var(--measure);
	margin-bottom: clamp(2.5rem, 5vw, 4rem);
}

.beat {
	display: grid;
	gap: 1rem 3rem;
	padding-block: clamp(1.75rem, 3vw, 2.5rem);
	border-top: 1px solid var(--rule);
}

.beat:last-child {
	border-bottom: 1px solid var(--rule);
}

@media (min-width: 768px) {
	.beat {
		grid-template-columns: minmax(0, 11rem) minmax(0, 1fr);
	}
}

/* At full width the beat becomes a proper ledger line: stage, entry, machinery. */
@media (min-width: 1100px) {
	.beat {
		grid-template-columns: minmax(0, 11rem) minmax(0, 1fr) minmax(0, 17rem);
		gap: 3rem;
		align-items: center;
	}
}

.beat__rail {
	display: flex;
	flex-wrap: wrap;
	align-items: baseline;
	gap: 0.65rem;
}

@media (min-width: 768px) {
	.beat__rail {
		flex-direction: column;
		gap: 0.5rem;
	}
}

.beat__stage {
	color: var(--color-text-secondary);
	font-size: 0.8125rem;
	font-weight: 500;
	text-wrap: balance;
}

.beat__text {
	max-width: 42ch;
	margin-top: 0.75rem;
	color: var(--color-text-secondary);
	font-size: 0.9375rem;
	line-height: 1.6;
	text-wrap: pretty;
}

.beat__machinery {
	margin-top: 1rem;
}

.beat__artifact {
	max-width: 17rem;
}

.beat__claim {
	max-width: 24ch;
	font-size: clamp(1.25rem, 2vw, 1.625rem);
	font-weight: 600;
	letter-spacing: -0.025em;
	line-height: 1.2;
	text-wrap: balance;
}
</style>
