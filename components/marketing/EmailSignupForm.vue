<script setup lang="ts">
const props = withDefaults(defineProps<{ inputId: string; buttonLabel?: string }>(), { buttonLabel: "Start free" });

const email = ref("");

const submit = async () => {
	const normalizedEmail = email.value.trim();
	if (!normalizedEmail) return;
	await navigateTo({ path: "/signup", query: { email: normalizedEmail } });
};
</script>

<template>
	<div>
		<form class="signup" @submit.prevent="submit">
			<label :for="props.inputId" class="sr-only">Work email</label>
			<input
				:id="props.inputId"
				v-model="email"
				type="email"
				name="email"
				autocomplete="email"
				inputmode="email"
				placeholder="you@company.com"
				required
				class="signup__input"
				:aria-describedby="`${props.inputId}-note`"
			/>
			<Pressable as="button" type="submit" class="signup__button">{{ props.buttonLabel }}</Pressable>
		</form>
		<p :id="`${props.inputId}-note`" class="ledger-meta mt-2.5">Free to start · two short steps · passkey or password</p>
	</div>
</template>

<style scoped>
/*
 * A ruled field rather than a boxed one: the input is a line you write on, and
 * the button is the only filled shape.
 */
.signup {
	display: grid;
	grid-template-columns: minmax(0, 1fr) auto;
	gap: 0.5rem;
	align-items: end;
	width: min(100%, 26rem);
}

.signup__input {
	min-width: 0;
	height: 2.75rem;
	padding-inline: 0.1rem;
	color: var(--color-text-primary);
	background: transparent;
	border-bottom: 1px solid var(--rule-strong);
	outline: none;
	font-size: 0.9375rem;
	transition: border-color var(--duration-fast) var(--ease-out);
}

.signup__input::placeholder {
	color: var(--color-text-tertiary);
}

.signup__input:hover {
	border-color: var(--color-text-tertiary);
}

.signup__input:focus {
	border-color: var(--color-ink);
	box-shadow: 0 1px 0 var(--color-ink);
}

.signup__button {
	height: 2.75rem;
	padding-inline: 1.15rem;
	color: var(--neutral-0);
	background: var(--color-ink);
	border-radius: var(--radius-sm);
	font-size: 0.875rem;
	font-weight: 560;
	white-space: nowrap;
	transition: background-color var(--duration-fast) var(--ease-out);
}

.signup__button:hover {
	background: var(--color-ink-hover);
}

@media (max-width: 420px) {
	.signup {
		grid-template-columns: 1fr;
	}
}
</style>
