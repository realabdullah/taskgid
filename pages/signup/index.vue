<script lang="ts" setup>
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

definePageMeta({ layout: "auth", name: "signup" });
</script>

<template>
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

		<Button class="w-full"> Create Account </Button>

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
</template>
