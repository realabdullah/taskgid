<script setup lang="ts">
type AuthMode = "login" | "signup";

const props = withDefaults(
	defineProps<{
		initialMode?: AuthMode;
	}>(),
	{
		initialMode: "login",
	}
);

const mode = ref<AuthMode>(props.initialMode);
const usingPasskeyLogin = ref(false);

const setMode = (nextMode: AuthMode) => {
	mode.value = nextMode;
	if (nextMode !== "login") {
		usingPasskeyLogin.value = false;
	}
};
</script>

<template>
	<section class="bg-canvas grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)]">
		<div class="bg-rail relative hidden min-h-screen overflow-hidden px-10 py-10 lg:flex lg:flex-col xl:px-16 xl:py-12">
			<svg aria-hidden="true" class="pointer-events-none absolute inset-0 h-full w-full opacity-10" viewBox="0 0 980 1080" fill="none" preserveAspectRatio="xMidYMid slice">
				<path d="M-120 52 342 52 512 142 950 142" stroke="currentColor" class="text-primary" stroke-width="6" />
				<path d="M-90 160 312 160 482 250 920 250" stroke="currentColor" class="text-primary" stroke-width="6" />
				<path d="M-160 268 282 268 452 358 890 358" stroke="currentColor" class="text-primary" stroke-width="6" />
				<path d="M-100 376 252 376 422 466 860 466" stroke="currentColor" class="text-primary" stroke-width="6" />
				<path d="M-130 484 222 484 392 574 830 574" stroke="currentColor" class="text-primary" stroke-width="6" />
				<path d="M-70 592 192 592 362 682 800 682" stroke="currentColor" class="text-primary" stroke-width="6" />
				<path d="M-110 700 162 700 332 790 770 790" stroke="currentColor" class="text-primary" stroke-width="6" />
			</svg>

			<div class="relative z-10 flex items-baseline justify-between text-white">
				<p class="font-mono text-sm font-bold tracking-[0.12em] uppercase">Taskgid</p>
				<p class="text-sidebar-foreground/55 text-xs">Task, get it done.</p>
			</div>

			<div class="relative z-10 mt-auto max-w-lg pb-8">
				<p class="text-primary font-mono text-[11px] font-semibold tracking-[0.16em] uppercase">Task management for teams</p>
				<h1 class="mt-4 text-5xl leading-[0.94] font-extrabold tracking-[-0.035em] text-white xl:text-6xl">Keep tasks moving.</h1>
				<p class="text-sidebar-foreground/70 mt-5 max-w-sm text-sm leading-6">A focused place to decide, assign, and finish what matters.</p>
			</div>
		</div>

		<div class="relative flex items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
			<div class="w-full max-w-[380px]">
				<div class="mb-10 flex items-baseline justify-between lg:hidden">
					<p class="font-mono text-sm font-bold tracking-[0.12em] uppercase">Taskgid</p>
					<p class="text-text-tertiary text-xs">Task, get it done.</p>
				</div>

				<Transition
					mode="out-in"
					enter-active-class="transition-all duration-[220ms] ease-out"
					leave-active-class="transition-all duration-[220ms] ease-out"
					enter-from-class="opacity-0 translate-y-2"
					leave-to-class="opacity-0 translate-y-2"
				>
					<div v-if="mode === 'login'" key="login">
						<p class="editorial-kicker">Welcome back</p>
						<h1 class="text-text-primary mt-2 text-3xl font-extrabold tracking-[-0.05em]">Your tasks are waiting.</h1>
						<p class="text-text-secondary mt-3 text-sm leading-6">Sign in to see what needs your attention now.</p>

						<div class="mt-6 space-y-4">
							<AuthPasskeyLogin v-if="usingPasskeyLogin" v-slot="{ isSubmitting }">
								<Button type="submit" variant="secondary" class="h-10 w-full" :disabled="isSubmitting" :loading="isSubmitting" loading-label="Signing in">
									Sign in with a passkey
								</Button>
							</AuthPasskeyLogin>

							<AuthLoginForm v-else v-slot="{ isSubmitting }">
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-2">
										<Checkbox id="remember" />
										<label for="remember" class="text-text-primary text-sm font-medium">Remember me</label>
									</div>
									<NuxtLink to="/reset-password" class="text-primary text-sm hover:underline">Forgot password?</NuxtLink>
								</div>
								<Button type="submit" class="h-10 w-full" :disabled="isSubmitting" :loading="isSubmitting" loading-label="Signing in">Sign in</Button>
							</AuthLoginForm>

							<div class="relative">
								<div class="absolute inset-0 flex items-center"><span class="border-border w-full border-t" /></div>
								<div class="relative flex justify-center text-xs uppercase"><span class="bg-canvas text-text-tertiary px-2 font-mono tracking-[0.08em]">or continue with</span></div>
							</div>

							<Button variant="secondary" class="h-10 w-full" @click="usingPasskeyLogin = !usingPasskeyLogin">
								<Icon name="hugeicons:key-02" :size="16" class="mr-2" />
								{{ usingPasskeyLogin ? "Use password instead" : "Sign in with a passkey" }}
							</Button>

							<p class="text-text-primary/90 text-center text-sm">
								Don't have an account?
								<button type="button" class="text-primary ml-1 font-medium hover:underline" @click="setMode('signup')">Sign up</button>
							</p>
						</div>
					</div>

					<div v-else key="signup">
						<p class="editorial-kicker">Create your account</p>
						<h1 class="text-text-primary mt-2 text-3xl font-extrabold tracking-[-0.05em]">Bring your tasks into focus.</h1>
						<p class="text-text-secondary mt-3 text-sm leading-6">Create your account and give your team a clear shared view of every task.</p>

						<div class="mt-6 space-y-4">
							<AuthSignupForm v-slot="{ isSubmitting }">
								<div class="flex items-start gap-2">
									<Checkbox id="terms" class="mt-0.5" />
									<label for="terms" class="text-text-primary text-sm">
										I agree to the
										<NuxtLink to="#" class="text-accent-strong font-medium hover:underline">terms of service</NuxtLink>
										and
										<NuxtLink to="#" class="text-accent-strong font-medium hover:underline">privacy policy</NuxtLink>
									</label>
								</div>
								<Button type="submit" class="h-10 w-full" :disabled="isSubmitting" :loading="isSubmitting" loading-label="Creating account">Create account</Button>
							</AuthSignupForm>

							<p class="text-text-primary/90 text-center text-sm">
								Already have an account?
								<button type="button" class="text-primary ml-1 font-medium hover:underline" @click="setMode('login')">Sign in</button>
							</p>
						</div>
					</div>
				</Transition>
			</div>
		</div>
	</section>
</template>
