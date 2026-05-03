<script lang="ts" setup>
definePageMeta({ layout: false, name: "accept-invite" });

const route = useRoute();
const token = computed(() => (typeof route.params.token === "string" ? route.params.token.trim() : ""));

type AcceptResponse = {
	success: boolean;
	message?: string;
	error?: string;
	isNewUser?: boolean;
	resetToken?: string;
};

type State = "validating" | "success" | "error";

const state = ref<State>("validating");
const errorMessage = ref("");

onMounted(async () => {
	if (!token.value) {
		errorMessage.value = "Invalid invite link. The token is missing.";
		state.value = "error";
		return;
	}

	try {
		const response = await useApiFetch<AcceptResponse>(API_ENDPOINTS.invites.accept, {
			method: "POST",
			body: { token: token.value },
		});

		if (!response?.success) {
			throw new Error(response?.error || "Failed to accept invitation");
		}

		state.value = "success";

		if (response.isNewUser && response.resetToken) {
			await navigateTo(`/reset-confirmation?token=${encodeURIComponent(response.resetToken)}`);
		} else {
			await navigateTo("/");
		}
	} catch (error) {
		errorMessage.value = getServerError(error);
		state.value = "error";
	}
});
</script>

<template>
	<div class="relative container mx-auto flex min-h-screen flex-col items-center justify-center p-6">
		<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]">
			<div class="flex flex-col items-center space-y-4 text-center">
				<div
					class="flex h-14 w-14 items-center justify-center rounded-full"
					:class="{
						'bg-primary': state === 'validating' || state === 'success',
						'bg-destructive/10': state === 'error',
					}"
				>
					<Icon v-if="state === 'validating'" name="hugeicons:loading-03" :size="28" class="animate-spin text-white" />
					<Icon v-else-if="state === 'success'" name="hugeicons:checkmark-circle-03" :size="28" class="text-white" />
					<Icon v-else name="hugeicons:alert-circle" :size="28" class="text-destructive" />
				</div>

				<template v-if="state === 'validating'">
					<h1 class="text-2xl font-bold">Validating Invite</h1>
					<p class="text-muted-foreground text-sm">Please wait while we verify your invite link…</p>
				</template>

				<template v-else-if="state === 'success'">
					<h1 class="text-2xl font-bold">Invitation Accepted</h1>
					<p class="text-muted-foreground text-sm">Redirecting you now…</p>
				</template>

				<template v-else>
					<h1 class="text-2xl font-bold">Invite Link Invalid</h1>
					<p class="text-muted-foreground text-sm">{{ errorMessage }}</p>

					<div class="bg-destructive/10 border-destructive/20 w-full rounded-md border px-4 py-3 text-left text-sm">
						<p class="text-destructive font-medium">This may have happened because:</p>
						<ul class="text-destructive/80 mt-1 list-inside list-disc space-y-1">
							<li>The invite link has expired</li>
							<li>The invite was already accepted or declined</li>
							<li>The link was copied incorrectly</li>
						</ul>
					</div>

					<NuxtLink to="/" class="text-primary text-sm font-medium underline-offset-4 hover:underline"> Go back to sign in </NuxtLink>
				</template>
			</div>
		</div>
	</div>
</template>
