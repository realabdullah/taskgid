<script lang="ts" setup>
const pageMap: { [key: string]: { title: string; description: string } } = {
	login: { title: "Welcome back", description: "Enter your credentials to access your account" },
	signup: { title: "Create an account", description: "Enter your details to create your account" },
	"reset-password": { title: "Reset Password", description: "Enter your email to receive a password reset link" },
	"reset-confirmation": { title: "Set New Password", description: "Create a new password for your account" },
};

const route = useRoute();
const page = computed(() => pageMap[route.name as keyof typeof pageMap]);
const isSplitAuthPage = computed(() => route.path === "/");
</script>

<template>
	<div v-if="isSplitAuthPage" class="min-h-screen">
		<slot />
	</div>

	<div v-else class="bg-canvas relative flex min-h-screen flex-col items-center justify-center p-6">
		<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
			<div class="flex flex-col space-y-2 text-center">
				<AppBrandMark class="text-primary mx-auto mb-4" size="lg" />
				<h1 class="text-3xl font-bold">{{ page?.title }}</h1>
				<p class="text-muted-foreground text-sm">{{ page?.description }}</p>
			</div>

			<slot />
		</div>
	</div>
</template>
