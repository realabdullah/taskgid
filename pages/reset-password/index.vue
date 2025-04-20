<script lang="ts" setup>
import { Button } from "@/components/ui/button";

definePageMeta({ layout: "auth", name: "reset-password" });
</script>

<template>
	<div class="grid gap-4">
		<AuthFormField id="email" label="Email" type="email" placeholder="name@example.com" required />

		<Button class="w-full"> Send Reset Link </Button>

		<p class="text-muted-foreground px-8 text-center text-sm">
			Remember your password?
			<NuxtLink to="/login" class="text-primary font-medium underline-offset-4 hover:underline"> Back to login </NuxtLink>
		</p>
	</div>
</template>
