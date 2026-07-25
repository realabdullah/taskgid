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
	<section class="bg-canvas grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(420px,0.85fr)]">
		<div class="bg-rail relative hidden overflow-hidden px-10 py-10 lg:flex lg:flex-col lg:justify-between xl:px-16">
			<div class="pointer-events-none absolute inset-y-0 right-[14%] w-px bg-white/10" />
			<div class="relative z-10 flex items-center gap-3 text-white">
				<AppBrandMark size="md" show-name inverted />
			</div>

			<div class="relative z-10 max-w-xl pb-8">
				<p class="text-sidebar-foreground/55 text-sm font-semibold">The focused workspace for product teams</p>
				<h1 class="mt-5 max-w-lg text-5xl leading-[0.98] font-extrabold tracking-[-0.065em] text-white xl:text-6xl">Make the next move obvious.</h1>
				<p class="text-sidebar-foreground/70 mt-6 max-w-md text-base leading-7">
					Taskgid brings priorities, ownership, and progress into one calm place—so teams can spend less time coordinating and more time moving.
				</p>
				<div class="border-sidebar-border mt-10 grid max-w-md grid-cols-3 divide-x overflow-hidden rounded-xl border bg-white/5 text-center">
					<div class="px-3 py-4">
						<p class="text-lg font-bold text-white">Focus</p>
						<p class="text-sidebar-foreground/55 mt-1 text-xs">what matters</p>
					</div>
					<div class="px-3 py-4">
						<p class="text-lg font-bold text-white">Flow</p>
						<p class="text-sidebar-foreground/55 mt-1 text-xs">keep moving</p>
					</div>
					<div class="px-3 py-4">
						<p class="text-lg font-bold text-white">Clarity</p>
						<p class="text-sidebar-foreground/55 mt-1 text-xs">shared context</p>
					</div>
				</div>
			</div>
		</div>

		<div class="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
			<div class="w-full max-w-[380px]">
				<div class="mb-8 text-center lg:hidden">
					<AppBrandMark class="text-primary mx-auto mb-3" size="md" />
					<p class="brand-wordmark text-text-primary">Taskgid</p>
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
