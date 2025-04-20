<script lang="ts" setup>
import { Button } from "@/components/ui/button";

definePageMeta({ layout: "auth", name: "reset-confirmation" });
</script>

<template>
	<div class="relative container flex min-h-screen flex-col items-center justify-center">
		<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
			<div class="flex flex-col space-y-2 text-center">
				<div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600">
					<Icon name="hugeicons:checkmark-circle-03" :size="24" class="text-white" />
				</div>
				<h1 class="text-3xl font-bold">Set New Password</h1>
				<p class="text-muted-foreground text-sm">Create a new password for your account</p>
			</div>

			<div class="grid gap-4">
				<AuthFormField id="password" label="New Password" type="password" placeholder="••••••••" required />
				<AuthFormField id="confirm-password" label="Confirm New Password" type="password" placeholder="••••••••" required />

				<Button class="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"> Reset Password </Button>

				<p class="text-muted-foreground px-8 text-center text-sm">
					Remember your password?
					<NuxtLink to="/login" class="text-primary font-medium underline-offset-4 hover:underline"> Back to login </NuxtLink>
				</p>
			</div>
		</div>
	</div>
</template>
