<script setup lang="ts">
import SignupJourney from "./SignupJourney.vue";
import LoginForm from "./LoginForm.vue";
import PasskeyLoginForm from "./PasskeyLoginForm.vue";

type AuthMode = "login" | "signup";

const props = withDefaults(defineProps<{ initialMode?: AuthMode }>(), { initialMode: "login" });
const mode = ref<AuthMode>(props.initialMode);
const usingPasskey = ref(false);
const previewName = ref("Ada");

const previewItems = [
	{ title: "Review mobile empty states", meta: "Product · Today", status: "In progress", tone: "bg-primary" },
	{ title: "Finalize launch checklist", meta: "Marketing · Aug 18", status: "To do", tone: "bg-text-tertiary" },
	{ title: "Ship API usage dashboard", meta: "Platform · Aug 20", status: "Review", tone: "bg-warning" },
];

const setMode = (nextMode: AuthMode) => {
	mode.value = nextMode;
	usingPasskey.value = false;
};
</script>

<template>
	<main class="bg-canvas min-h-svh p-3 sm:p-4">
		<div
			class="border-border bg-surface-0 mx-auto grid min-h-[calc(100svh-1.5rem)] max-w-[1500px] overflow-hidden rounded-xl border shadow-xs lg:grid-cols-[minmax(430px,0.82fr)_minmax(0,1.18fr)]"
		>
			<section class="flex min-h-[calc(100svh-2rem)] flex-col px-6 py-6 sm:px-10 lg:px-14 lg:py-10">
				<header class="flex items-center justify-between">
					<AppBrandMark show-name size="sm" />
					<span class="text-text-tertiary text-xs">Task, get it done.</span>
				</header>

				<div class="my-auto w-full max-w-[410px] py-12 lg:mx-auto">
					<Transition
						mode="out-in"
						enter-active-class="transition duration-200 ease-out"
						leave-active-class="transition duration-150 ease-in"
						enter-from-class="translate-y-2 opacity-0"
						leave-to-class="translate-y-1 opacity-0"
					>
						<div v-if="mode === 'login'" key="login">
							<p class="text-primary text-xs font-semibold tracking-[0.08em] uppercase">Welcome back</p>
							<h1 class="text-text-primary mt-3 text-3xl font-semibold tracking-[-0.045em] text-balance sm:text-4xl">Pick up where the work left off.</h1>
							<p class="text-text-secondary mt-3 text-sm leading-6">Sign in to see your team’s priorities, decisions, and next moves.</p>

							<div class="mt-7 space-y-4">
								<PasskeyLoginForm v-if="usingPasskey" v-slot="{ isSubmitting }">
									<Button type="submit" class="h-11 w-full" :disabled="isSubmitting" :loading="isSubmitting" loading-label="Signing in">Continue with passkey</Button>
								</PasskeyLoginForm>
								<LoginForm v-else v-slot="{ isSubmitting }">
									<div class="flex items-center justify-between">
										<label class="text-text-secondary flex items-center gap-2 text-xs"><Checkbox id="remember" />Remember me</label>
										<NuxtLink to="/reset-password" class="text-primary text-xs font-medium hover:underline">Forgot password?</NuxtLink>
									</div>
									<Button type="submit" class="h-11 w-full" :disabled="isSubmitting" :loading="isSubmitting" loading-label="Signing in">Sign in</Button>
								</LoginForm>

								<Button type="button" variant="secondary" class="h-11 w-full" @click="usingPasskey = !usingPasskey">
									<Icon name="lucide:key-round" :size="15" />{{ usingPasskey ? "Use email and password" : "Use a passkey" }}
								</Button>
								<p class="text-text-secondary text-center text-sm">
									New to Taskgid? <Button type="button" variant="link" size="inline" static @click="setMode('signup')">Create an account</Button>
								</p>
							</div>
						</div>

						<div v-else key="signup">
							<p class="text-primary text-xs font-semibold tracking-[0.08em] uppercase">Start with clarity</p>
							<h1 class="text-text-primary mt-3 text-3xl font-semibold tracking-[-0.045em] text-balance sm:text-4xl">A calmer way to move work forward.</h1>
							<p class="text-text-secondary mt-3 mb-7 text-sm leading-6">Two short steps. No setup maze.</p>
							<SignupJourney @back="setMode('login')" @preview="previewName = $event" />
						</div>
					</Transition>
				</div>

				<footer class="text-text-tertiary flex items-center justify-between text-xs">
					<span>© {{ new Date().getFullYear() }} Taskgid</span><span>Private by design</span>
				</footer>
			</section>

			<aside class="bg-surface-1 border-border text-text-primary relative hidden overflow-hidden border-s p-8 lg:block xl:p-12">
				<div class="absolute inset-0 opacity-60" style="background-image: radial-gradient(circle at 1px 1px, var(--color-border-strong) 1px, transparent 0); background-size: 24px 24px" />
				<div class="relative flex h-full flex-col">
					<div class="text-text-tertiary flex items-center justify-between text-xs">
						<span>A live view of what matters</span><span class="border-border bg-surface-0 rounded-md border px-2.5 py-1">Today</span>
					</div>

					<div class="my-auto">
						<p class="text-text-tertiary text-xs font-medium">Good morning, {{ previewName }}</p>
						<h2 class="mt-2 max-w-xl text-4xl font-semibold tracking-[-0.05em] xl:text-5xl">Make the next move obvious.</h2>
						<div class="border-border bg-surface-0 mt-8 overflow-hidden rounded-xl border shadow-sm">
							<div class="border-border flex items-center justify-between border-b px-5 py-4">
								<span class="text-sm font-medium">Your queue</span><span class="text-text-tertiary text-xs">3 open</span>
							</div>
							<div class="divide-border divide-y">
								<div
									v-for="(item, index) in previewItems"
									:key="item.title"
									class="auth-preview-row grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 py-4"
									:style="{ animationDelay: `${index * 120 + 180}ms` }"
								>
									<span class="h-2 w-2 rounded-full" :class="item.tone" />
									<span
										><span class="block truncate text-sm font-medium">{{ item.title }}</span
										><span class="text-text-tertiary mt-1 block text-xs">{{ item.meta }}</span></span
									>
									<span class="bg-surface-2 text-text-secondary rounded-md px-2 py-1 text-xs">{{ item.status }}</span>
								</div>
							</div>
						</div>
					</div>

					<p class="text-text-tertiary max-w-md text-xs leading-5">Fast navigation, clear hierarchy, and fewer dead-end screens.</p>
				</div>
			</aside>
		</div>
	</main>
</template>

<style scoped>
.auth-preview-row {
	opacity: 0;
	filter: blur(4px);
	animation: auth-preview-enter 320ms var(--ease-out) both;
	transition-property: background-color, transform;
	transition-duration: var(--duration-fast);
	transition-timing-function: var(--ease-out);
}

.auth-preview-row:hover {
	background: var(--color-surface-1);
	transform: translateX(2px);
}

@keyframes auth-preview-enter {
	from {
		opacity: 0;
		filter: blur(4px);
		transform: translateY(12px);
	}

	to {
		opacity: 1;
		filter: blur(0);
		transform: translateY(0);
	}
}

@media (prefers-reduced-motion: reduce) {
	.auth-preview-row {
		opacity: 1;
		filter: none;
		animation: none;
	}
}
</style>
