<script lang="ts" setup>
const isTokenInvalid = ref(false);

const verifyToken = async () => {};

await verifyToken();
</script>

<template>
	<BaseModal v-if="isTokenInvalid" width="50rem" :closable="false">
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
