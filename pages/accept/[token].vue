<script lang="ts" setup>
const route = useRoute();
const { $axios } = useNuxtApp();

const token = computed(() => route.params.token);
const isTokenInvalid = ref(false);

const acceptInvite = async () => {
	try {
		if (!token.value) throw new Error("Invalid token");
		const { data } = await $axios.post<{ success: boolean; isNew: boolean }>("/invite/accept/", { token: token.value });

		if (!data.success) throw new Error("Invalid token");

		if (data.isNew) navigateTo(`/signup?token=${token.value}`);
		else navigateTo("/login");
	} catch (error) {
		isTokenInvalid.value = true;
	}
};

await acceptInvite();
</script>

<template>
	<div v-if="isTokenInvalid">
		<BaseModal width="50rem" :closable="false">
			<template #default>
				<div class="modal flex flex-column items-center content-center">
					<p class="weight-regular col-grey text-center">
						Oops, something went wrong! It seems there's an issue with the invitation. Please double-check the link or contact our support team for assistance. We're here to help you get
						started.
					</p>
					<BaseButton value="Go Home" usage="button" @click="navigateTo('/login')" />
				</div>
			</template>
		</BaseModal>
	</div>
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
