<script lang="ts" setup>
const pageMap: { [key: string]: { title: string; description: string } } = {
	login: { title: "Welcome back", description: "Enter your email and password to sign in." },
	signup: { title: "Create an account", description: "Enter your details to create your account." },
	"reset-password": { title: "Reset your password", description: "Enter your email address and we’ll send you a reset link." },
	"reset-confirmation": { title: "Set a new password", description: "Choose a new password for your account." },
};

const route = useRoute();
const page = computed(() => pageMap[route.name as keyof typeof pageMap]);
const isSplitAuthPage = computed(() => route.path === "/login" || route.path === "/signup");
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
