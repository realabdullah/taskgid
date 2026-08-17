<script lang="ts" setup>
definePageMeta({ layout: "marketing", name: "home" });

useHead({
	title: "Taskgid — every task keeps its own record",
	meta: [
		{
			name: "description",
			content: "A small task workspace for product teams. Owners, due dates, discussion and the full history of how a task moved, all kept on the task itself.",
		},
	],
});
</script>

<template>
	<div class="home">
		<MarketingHeader />

		<main>
			<section id="record" class="hero">
				<div class="hero__paper" aria-hidden="true" />

				<div class="ledger-container hero__inner">
					<p class="ledger-meta hero__eyebrow">Task management · small product teams</p>
					<h1 class="ledger-display hero__title">
						<MarketingWordReveal text="Every task keeps" :delay="80" />
						<span class="hero__title-line"><MarketingWordReveal text="its own record." :delay="360" /></span>
					</h1>
					<p class="ledger-prose hero__lede">
						Who asked for it, who owns it, what was decided and every move it made. Taskgid keeps all of it on the task, so nobody has to reconstruct the story from a chat thread.
					</p>
					<div class="hero__form">
						<MarketingEmailSignupForm input-id="hero-email" />
					</div>

					<div class="hero__desk">
						<MarketingHeroDesk />
					</div>
				</div>
			</section>

			<MarketingTaskLife />
			<MarketingInventory />

			<section class="close">
				<div class="ledger-container close__grid">
					<MarketingReveal>
						<p class="ledger-meta">Start</p>
						<h2 class="ledger-title mt-4 max-w-[16ch]">Open a workspace and write the first line.</h2>

						<div class="close__object">
							<div>
								<p class="ledger-meta">Closed 15 Aug · by Kola</p>
								<p class="close__object-title">Empty states for the mobile task list</p>
							</div>
							<span class="close__stamp"><Icon name="lucide:check" :size="13" />Done</span>
						</div>
					</MarketingReveal>
					<MarketingReveal :delay="120" class="close__action">
						<p class="ledger-prose text-[0.9375rem]">One task is enough to see whether this way of working suits your team.</p>
						<div class="mt-7">
							<MarketingEmailSignupForm input-id="close-email" button-label="Create a workspace" />
						</div>
						<p class="mt-6 text-sm">
							<NuxtLink to="/login" class="ledger-underline text-text-secondary hover:text-text-primary">Already have an account? Sign in</NuxtLink>
						</p>
					</MarketingReveal>
				</div>
			</section>
		</main>

		<MarketingFooter />
	</div>
</template>

<style scoped>
.hero {
	position: relative;
	overflow: clip;
	padding-block: clamp(3rem, 6vw, 5rem) clamp(4rem, 8vw, 6.5rem);
}

/* Dotted paper. It is the surface everything else rests on, so it stays faint. */
.hero__paper {
	position: absolute;
	inset: 0;
	background-image: radial-gradient(circle at 1px 1px, var(--color-border-strong) 1px, transparent 0);
	background-size: 22px 22px;
	mask-image: radial-gradient(ellipse 80% 70% at 50% 35%, black 30%, transparent 100%);
	opacity: 0.5;
	pointer-events: none;
}

.hero__inner {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
}

.hero__eyebrow {
	animation: hero-fade 600ms var(--ease-out) both;
}

.hero__title {
	margin-top: 1.5rem;
	max-width: 18ch;
}

.hero__title-line {
	display: block;
	color: var(--color-text-tertiary);
}

.hero__lede {
	margin-top: 1.5rem;
	text-wrap: balance;
	animation: hero-fade 700ms var(--ease-out) 620ms both;
}

.hero__form {
	margin-top: 2.25rem;
	animation: hero-fade 700ms var(--ease-out) 760ms both;
}

.hero__desk {
	width: 100%;
	margin-top: clamp(3rem, 6vw, 4.5rem);
}

@keyframes hero-fade {
	from {
		opacity: 0;
		transform: translateY(10px);
	}

	to {
		opacity: 1;
		transform: none;
	}
}

@media (prefers-reduced-motion: reduce) {
	.hero__eyebrow,
	.hero__lede,
	.hero__form {
		animation: none;
	}
}

.close {
	padding-block: clamp(4.5rem, 9vw, 8rem);
	border-top: 1px solid var(--rule);
}

.close__grid {
	display: grid;
	gap: clamp(2.5rem, 5vw, 4rem);
}

@media (min-width: 900px) {
	.close__grid {
		grid-template-columns: minmax(0, 1fr) minmax(24rem, 0.85fr);
		align-items: start;
	}
}

/* The note from the hero, closed out. The page ends where the task ends. */
.close__object {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1.5rem;
	width: min(100%, 24rem);
	margin-top: 2.5rem;
	padding: 0.9rem 1rem;
	background: var(--color-surface-0);
	border: 1px solid var(--rule);
	border-radius: var(--radius-md);
	box-shadow: var(--shadow-xs);
	transform: rotate(-1deg);
	transition:
		transform var(--duration-normal) var(--ease-out),
		box-shadow var(--duration-normal) var(--ease-out);
}

.close__object:hover {
	box-shadow: var(--shadow-sm);
	transform: rotate(0deg) translateY(-2px);
}

.close__object-title {
	margin-top: 0.35rem;
	font-size: 0.8125rem;
	font-weight: 560;
	text-decoration: line-through;
	text-decoration-color: var(--color-border-strong);
}

.close__stamp {
	display: inline-flex;
	flex-shrink: 0;
	align-items: center;
	gap: 0.3rem;
	padding: 0.25rem 0.5rem;
	color: var(--color-status-done);
	background: var(--color-status-done-bg);
	border-radius: var(--radius-xs);
	font-size: 0.71875rem;
	font-weight: 600;
}
</style>
