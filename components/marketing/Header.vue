<template>
	<header class="ledger-header">
		<nav class="ledger-container flex h-16 items-center justify-between gap-6" aria-label="Primary navigation">
			<NuxtLink to="/" aria-label="Taskgid home" class="focus-ring rounded-sm">
				<AppBrandMark show-name size="sm" />
			</NuxtLink>

			<div class="flex items-center gap-5">
				<NuxtLink to="/login" class="ledger-link">Sign in</NuxtLink>
				<NuxtLink to="/signup" class="ledger-header__cta">Start free</NuxtLink>
			</div>
		</nav>
	</header>
</template>

<style scoped>
.ledger-header {
	position: sticky;
	top: 0;
	z-index: var(--z-sticky);
	background: var(--paper);
	border-bottom: 1px solid var(--rule);
}

/* The only button-shaped thing in the top rail; everything else is text. */
.ledger-header__cta {
	display: inline-flex;
	align-items: center;
	height: 2.125rem;
	padding-inline: 0.9rem;
	color: var(--neutral-0);
	background: var(--color-ink);
	border-radius: var(--radius-sm);
	font-size: 0.8125rem;
	font-weight: 560;
	transition: background-color var(--duration-fast) var(--ease-out);
}

.ledger-header__cta:hover {
	background: var(--color-ink-hover);
}

.ledger-header__cta:focus-visible {
	outline: 2px solid var(--color-focus);
	outline-offset: 3px;
}
</style>
