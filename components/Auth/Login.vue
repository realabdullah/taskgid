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
	<section class="bg-surface-1 grid min-h-screen grid-cols-1 lg:grid-cols-2">
		<div class="bg-primary relative hidden overflow-hidden px-10 py-12 lg:flex lg:flex-col lg:justify-between">
			<div class="absolute inset-0 bg-black/10" />
			<div
				class="absolute inset-0 opacity-55"
				style="background-image: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.25), transparent 45%), radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.2), transparent 40%)"
			/>
			<div class="relative z-10 flex items-center gap-2 text-white">
				<div class="flex h-8 w-8 items-center justify-center rounded-md bg-white/15">
					<Icon name="hugeicons:checkmark-circle-03" :size="18" />
				</div>
				<span class="font-display text-lg font-semibold">TaskGid</span>
			</div>

			<div class="relative z-10 max-w-md">
				<p class="font-display text-3xl leading-tight font-semibold text-white drop-shadow-sm">Your team's work, in one clear view.</p>
				<p class="mt-4 text-sm leading-normal text-white/95 drop-shadow-sm">Plan, prioritize, and deliver with less switching and clearer momentum.</p>
			</div>
		</div>

		<div class="flex items-center justify-center px-5 py-10 sm:px-8">
			<div class="w-full max-w-[380px]">
				<div class="mb-8 text-center lg:hidden">
					<div class="bg-primary mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-md text-white">
						<Icon name="hugeicons:checkmark-circle-03" :size="20" />
					</div>
					<p class="font-display text-text-primary text-xl font-semibold">TaskGid</p>
				</div>

				<Transition
					mode="out-in"
					enter-active-class="transition-all duration-[220ms] ease-out"
					leave-active-class="transition-all duration-[220ms] ease-out"
					enter-from-class="opacity-0 translate-y-2"
					leave-to-class="opacity-0 translate-y-2"
				>
					<div v-if="mode === 'login'" key="login">
						<h1 class="font-display text-text-primary text-xl font-semibold">Welcome back</h1>
						<p class="text-text-primary/90 mt-1 text-sm">Sign in to pick up where your team left off.</p>

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
								<div class="relative flex justify-center text-xs uppercase"><span class="bg-surface-1 text-text-tertiary px-2">or continue with</span></div>
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
						<h1 class="font-display text-text-primary text-xl font-semibold">Create your account</h1>
						<p class="text-text-primary/90 mt-1 text-sm">Create your account and start organizing work with clarity.</p>

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
