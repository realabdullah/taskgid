<script lang="ts" setup>
import { Button } from "@/components/ui/button";

definePageMeta({ layout: "auth", name: "reset-confirmation" });
</script>

<template>
	<div class="grid gap-4">
		<AuthFormField id="password" label="New Password" type="password" placeholder="••••••••" required />
		<AuthFormField id="confirm-password" label="Confirm New Password" type="password" placeholder="••••••••" required />

		<Button class="w-full"> Reset Password </Button>

		<p class="text-muted-foreground px-8 text-center text-sm">
			Remember your password?
			<NuxtLink to="/login" class="text-primary font-medium underline-offset-4 hover:underline"> Back to login </NuxtLink>
		</p>
	</div>
</template>
