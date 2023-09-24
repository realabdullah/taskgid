<script lang="ts" setup>
definePageMeta({
	title: "Login",
	name: "login",
	middleware: ["guest"],
});

const { activeWorkspace } = storeToRefs(useStore());
const { fetchUserWorkspaces, setActiveWorkspace } = useStore();

const form = reactive({
	email: "",
	password: "",
});
const submitting = ref(false);
const loginError = ref("");
const client = useSupabaseAuthClient();

watchEffect(() => {
	if (form.email !== "" && form.password !== "") loginError.value = "";
});

const submitForm = async () => {
	try {
		if (form.email === "" || form.password === "") return;
		submitting.value = true;
		const { error } = await client.auth.signInWithPassword({
			email: form.email,
			password: form.password,
		});

		if (error) throw new Error(error.message);
		setTimeout(async () => {
			await fetchUserWorkspaces();
			setActiveWorkspace();
			submitting.value = false;
			navigateTo({ name: "dashboard", params: { workspace: activeWorkspace.value } });
		}, 2000);
	} catch (error) {
		loginError.value = error as string;
		submitting.value = false;
		setTimeout(() => {
			loginError.value = "";
		}, 2000);
	}
};
</script>

<template>
	<NuxtLayout name="auth">
		<BaseToast v-if="!!loginError" toast-style="solid" type="error" message="Login Error!" :description="loginError" />
		<template #cta>Create Account</template>
		<div class="login__form d-flex fd-column jc-center ai-flex-start w-100 h-100">
			<h5 class="login__form-header fw-bold col-black">Welcome Back.</h5>

			<form class="d-flex fd-column jc-center ai-center w-100" @submit.prevent="submitForm">
				<BaseInput
					v-model="form.email"
					input-type="email"
					label-for="email"
					label="Email Address"
					placeholder="anon@anon.anon"
					hint="Example. mano@gmail.com"
					border-color="#2746D8"
					:required="true" />

				<BaseInput
					v-model="form.password"
					input-type="password"
					label-for="password"
					label="Enter Your Password"
					placeholder="Enter password"
					hint="Upto 8 characters with an Uppercase, symbol and number"
					border-color="#2746D8"
					:required="true" />

				<BaseButton width="20.4rem" :value="submitting ? 'loading' : 'Log In'" background="#3754DB" color="#FFFFFF" />
			</form>

			<NuxtLink to="/forget-password" class="login__form-footer col-blue td-none fw-semiBold cursor-pointer">Forgot Password ?</NuxtLink>
		</div>
	</NuxtLayout>
</template>

<style lang="scss" scoped>
.login__form {
	max-width: 40rem;
	margin: 0 auto;

	&-header {
		@include font(3.2rem, 3.8rem);
		margin-bottom: 3.2rem;
	}

	&-footer {
		@include font(1.8rem, 2.2rem);
		margin-top: 5.2rem;
	}
}
</style>
