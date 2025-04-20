<script lang="ts" setup>
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

definePageMeta({ layout: "auth", name: "signup" });
</script>

<template>
	<div class="relative container flex min-h-screen flex-col items-center justify-center">
		<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
			<div class="flex flex-col space-y-2 text-center">
				<div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600">
					<Icon name="hugeicons:checkmark-circle-03" :size="24" class="text-white" />
				</div>
				<h1 class="text-3xl font-bold">Create an account</h1>
				<p class="text-muted-foreground text-sm">Enter your details to create your account</p>
			</div>

			<div class="grid gap-4">
				<AuthFormField id="name" label="Full Name" placeholder="John Doe" required />
				<AuthFormField id="email" label="Email" type="email" placeholder="name@example.com" required />
				<AuthFormField id="password" label="Password" type="password" placeholder="••••••••" required />
				<AuthFormField id="confirm-password" label="Confirm Password" type="password" placeholder="••••••••" required />

				<div class="flex items-center space-x-2">
					<Checkbox id="terms" />
					<label htmlFor="terms" class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
						I agree to the
						<NuxtLink to="#" class="text-primary font-medium underline-offset-4 hover:underline"> terms of service </NuxtLink> and
						<NuxtLink to="#" class="text-primary font-medium underline-offset-4 hover:underline"> privacy policy </NuxtLink>
					</label>
				</div>

				<Button class="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"> Create Account </Button>

				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<span class="w-full border-t" />
					</div>
					<div class="relative flex justify-center text-xs uppercase">
						<span class="bg-background text-muted-foreground px-2">Or continue with</span>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-2">
					<Button variant="outline">Google</Button>
					<Button variant="outline">GitHub</Button>
				</div>

				<p class="text-muted-foreground px-8 text-center text-sm">
					Already have an account?
					<NuxtLink to="/login" class="text-primary pl-1 font-medium underline-offset-4 hover:underline"> Sign in </NuxtLink>
				</p>
			</div>
		</div>
	</div>
</template>
