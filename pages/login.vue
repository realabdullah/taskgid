<script lang="ts" setup>
definePageMeta({
	title: "Login",
	name: "login",
	middleware: ["guest"],
});

const form = reactive({
	email: "",
	password: "",
});
const submitting = ref(false);
const client = useSupabaseAuthClient();

const submitForm = async () => {
	try {
		if (form.email === "" || form.password === "") return;
		submitting.value = true;
		const { error } = await client.auth.signInWithPassword({
			email: form.email,
			password: form.password,
		});

		if (error) throw new Error(error.message);

		submitting.value = false;
		navigateTo({ name: "home", replace: true });
	} catch (error) {
		submitting.value = false;
		useEvent("toast", useFormatError(error as string));
	}
};
</script>

<template>
	<NuxtLayout name="auth">
		<template #cta>Create Account</template>
		<div class="login__form d-flex fd-column jc-center ai-flex-start w-100 h-100">
			<h5 class="login__form-header fw-bold col-black">Welcome Back.</h5>

			<form class="d-flex fd-column jc-center ai-center w-100" @submit.prevent="submitForm">
				<BaseInput id="email" v-model="form.email" type="email" label="Email Address" :required="true" />
				<BaseInput id="password" v-model="form.password" type="password" label="Enter Your Password" :required="true" />
				<BaseButton :value="submitting ? 'loading' : 'Log In'" />
			</form>

			<NuxtLink to="/forget-password" class="login__form-footer col-blue td-none fw-semiBold cursor-pointer">Forgot Password ?</NuxtLink>
		</div>
	</NuxtLayout>
</template>

<style lang="scss" scoped>
.login__form {
	&-header {
		@include font(3.2rem, 3.8rem);
		margin-bottom: 3.2rem;
	}

	form {
		@include gap(2.4rem);
	}

	&-footer {
		@include font(1.8rem, 2.2rem);
		margin-top: 2rem;
	}
}
</style>
