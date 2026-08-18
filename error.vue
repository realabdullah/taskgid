<script setup lang="ts">
import type { NuxtError } from "#app";

/*
 * The error page is a brand surface too: same paper, same rules, same mono
 * marginalia as the rest of Taskgid, so a dead end still looks like the product.
 */
const props = defineProps<{ error: NuxtError }>();

const isMissing = computed(() => props.error?.statusCode === 404);

useHead({ title: () => (isMissing.value ? "Page not found · Taskgid" : "Something went wrong · Taskgid") });
const heading = computed(() => (isMissing.value ? "That page isn’t here." : "Something went wrong."));
const body = computed(() =>
	isMissing.value
		? "The link may be old, or the workspace it pointed at may have moved. Your work is untouched."
		: "The page failed to load. Trying again usually clears it; if it doesn’t, the record of what you were doing is still safe."
);
</script>

<template>
	<div class="error-page" data-theme="light">
		<header class="error-page__bar">
			<NuxtLink to="/" aria-label="Taskgid home" class="focus-ring rounded-sm"><AppBrandMark show-name size="sm" /></NuxtLink>
			<span class="error-meta">{{ error?.statusCode ?? "error" }}</span>
		</header>

		<main class="error-page__body">
			<p class="error-meta">{{ isMissing ? "404 · not found" : `${error?.statusCode ?? 500} · server error` }}</p>
			<h1 class="error-page__title">{{ heading }}</h1>
			<p class="error-page__text">{{ body }}</p>

			<div class="error-page__actions">
				<Button class="h-10 px-4" @click="clearError({ redirect: '/app' })">Back to my work</Button>
				<Button variant="secondary" class="h-10 px-4" @click="clearError({ redirect: '/' })">Go to the home page</Button>
			</div>

			<p v-if="error?.message && !isMissing" class="error-page__detail">{{ error.message }}</p>
		</main>

		<footer class="error-page__bar error-page__bar--foot">
			<span class="error-meta">© {{ new Date().getFullYear() }} Taskgid</span>
			<span class="error-meta">Task, get it done.</span>
		</footer>
	</div>
</template>

<style scoped>
.error-page {
	display: flex;
	flex-direction: column;
	min-height: 100svh;
	padding-inline: clamp(1.25rem, 5vw, 3rem);
	color: var(--color-text-primary);
	background: var(--neutral-25);
	color-scheme: light;
}

.error-page__bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	height: 4rem;
	border-bottom: 1px solid var(--color-border);
}

.error-page__bar--foot {
	border-top: 1px solid var(--color-border);
	border-bottom: 0;
}

.error-meta {
	color: var(--color-text-tertiary);
	font-family: var(--font-mono);
	font-size: 0.6875rem;
	letter-spacing: 0.02em;
	font-variant-numeric: tabular-nums;
}

.error-page__body {
	max-width: 34rem;
	margin-block: auto;
	padding-block: 4rem;
}

.error-page__title {
	margin-top: 1.25rem;
	font-size: clamp(2rem, 4vw, 3rem);
	font-weight: 640;
	letter-spacing: -0.035em;
	line-height: 1.05;
	text-wrap: balance;
}

.error-page__text {
	margin-top: 1.25rem;
	color: var(--color-text-secondary);
	font-size: 1rem;
	line-height: 1.65;
	text-wrap: pretty;
}

.error-page__actions {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
	margin-top: 2rem;
}

.error-page__detail {
	margin-top: 2rem;
	padding-top: 1rem;
	color: var(--color-text-tertiary);
	border-top: 1px solid var(--color-border);
	font-family: var(--font-mono);
	font-size: 0.71875rem;
	line-height: 1.6;
	word-break: break-word;
}
</style>
