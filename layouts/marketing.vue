<template>
	<div class="ledger-shell" data-theme="light">
		<slot />
	</div>
</template>

<style>
/*
 * The marketing surface is one sheet of paper, ruled like a ledger. Hierarchy
 * comes from type, hairlines and space — never from a change of background.
 * Colour appears only where it carries meaning: the product's own status and
 * priority tokens, and nothing else.
 */
.ledger-shell {
	--paper: var(--neutral-25);
	--rule: var(--color-border);
	--rule-strong: var(--color-border-strong);
	/* The one object colour on the page: the paper a note is written on. */
	--note-paper: oklch(0.943 0.062 96);

	--measure: 34rem;
	--gutter: clamp(1.25rem, 4vw, 3rem);

	min-height: 100svh;
	color: var(--color-text-primary);
	background: var(--paper);
	color-scheme: light;
	font-feature-settings: "ss01", "ss02", "cv02";
}

.ledger-container {
	width: min(100% - var(--gutter) * 2, 74rem);
	margin-inline: auto;
}

/* Marginalia: timestamps, actors, indices, field labels. */
.ledger-meta {
	color: var(--color-text-tertiary);
	font-family: var(--font-mono);
	font-size: 0.6875rem;
	font-weight: 500;
	letter-spacing: 0.02em;
	font-variant-numeric: tabular-nums;
}

.ledger-display {
	font-size: clamp(2.5rem, 5.2vw, 4rem);
	font-weight: 640;
	letter-spacing: -0.035em;
	line-height: 1.02;
	text-wrap: balance;
}

.ledger-title {
	font-size: clamp(1.65rem, 2.8vw, 2.35rem);
	font-weight: 620;
	letter-spacing: -0.03em;
	line-height: 1.08;
	text-wrap: balance;
}

.ledger-prose {
	max-width: var(--measure);
	color: var(--color-text-secondary);
	font-size: 1rem;
	line-height: 1.65;
	text-wrap: pretty;
}

.ledger-link {
	color: var(--color-text-secondary);
	font-size: 0.875rem;
	transition: color var(--duration-fast) var(--ease-out);
}

.ledger-link:hover {
	color: var(--color-text-primary);
}

.ledger-link:focus-visible {
	border-radius: var(--radius-xs);
	outline: 2px solid var(--color-focus);
	outline-offset: 4px;
}

/* Underlined text link, ledger style: the rule sits low and thickens on hover. */
.ledger-underline {
	text-decoration: underline;
	text-decoration-color: var(--rule-strong);
	text-decoration-thickness: 1px;
	text-underline-offset: 0.28em;
	transition: text-decoration-color var(--duration-fast) var(--ease-out);
}

.ledger-underline:hover {
	text-decoration-color: currentcolor;
}
</style>
