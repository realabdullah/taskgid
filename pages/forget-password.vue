<script lang="ts" setup>
definePageMeta({
	name: "forget-password",
});

const resetCodesent = ref<boolean>(false);
const resetCode = ref<number>(0);
const email = ref<string>("");

const sendResetCode = () => {
	if (email.value === "") return;
	resetCodesent.value = true;
};
</script>

<template>
	<div class="reset-page w-100 h-full">
		<div class="forget__pasword w-100 m-auto h-100 flex flex-column content-center items-start position-fixed">
			<h5 class="forget__pasword-header weight-semiBold col-black">Forgot Password?</h5>
			<p class="forget__pasword-text weight-regular col-grey-3">We are sorry to hear that happen. Don’t be sad, let's help you get back to productivity in no time.</p>

			<form class="w-100 flex flex-column content-center items-center" @submit.prevent="sendResetCode">
				<BaseInput v-if="resetCodesent" id="otp" v-model="resetCode" type="number" label="Enter OTP" />
				<BaseInput v-else id="email" v-model="email" type="email" label="Email Address" />

				<BaseButton type="submit" :value="resetCodesent ? 'Recover Account.' : 'Next'" />
			</form>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.reset-page {
	background: url("~/assets/images/passwordresetbg.png") center/cover no-repeat;

	.forget__pasword {
		max-width: 40rem;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		&-header {
			@include font(2.4rem, 3.2rem);
			margin-bottom: 1.2rem;
		}

		&-text {
			@include font(1.4rem, 2rem);
			margin-bottom: 3.2rem;
		}

		form {
			@include gap(2.4rem);
			margin-bottom: 6rem;
		}
	}
}
</style>
