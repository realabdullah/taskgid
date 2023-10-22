<script lang="ts" setup>
const route = useRoute();
const { verifyInviteToken, addUserToWorkspace } = useStore();

const token = route.params.token as string;
const isTokenInvalid = ref(false);

const verifyToken = async () => {
	try {
		if (!token) throw new Error("Invalid token.");
		const { ok, email, workspace } = await verifyInviteToken(token);
		if (!ok) throw new Error("Invalid token.");

		const userExists = await checkUserExists(email);
		if (userExists) {
			await addUserToWorkspace(email, token, workspace);
			navigateTo("/login");
		} else navigateTo(`/signup?email=${email}&workspace=${workspace}`);
	} catch {
		isTokenInvalid.value = true;
		useEvent("toast", "Invalid token.");
	}
};

const checkUserExists = async (email: string) => {
	const { userExists } = await $fetch("/api/check_user", {
		method: "POST",
		body: JSON.stringify({ email }),
	});

	return userExists;
};

await verifyToken();
</script>

<template>
	<BaseModal v-if="isTokenInvalid" width="50rem" :closable="false">
		<template #default>
			<div class="modal d-flex fd-column ai-center jc-center">
				<p class="fw-regular col-grey ta-center">
					Oops, something went wrong! It seems there's an issue with the invitation. Please double-check the link or contact our support team for assistance. We're here to help you get
					started.
				</p>
				<BaseButton value="Go Home" usage="button" @click="navigateTo('/login')" />
			</div>
		</template>
	</BaseModal>
</template>

<style lang="scss" scoped>
.modal {
	padding: 3rem;
	gap: 3rem;

	p {
		@include font(1.8rem, 2.4rem);
	}
}
</style>
