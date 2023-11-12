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
const {
	public: { apiUrl },
} = useRuntimeConfig();
const { user } = storeToRefs(useStore());
const { rememberMe } = storeToRefs(useTokenStore());
const { setToken, setTemporaryToken } = useToken();

const push = usePush();

const submitForm = async () => {
	try {
		if (form.email === "" || form.password === "") return;
		submitting.value = true;
		const response = await $fetch<UserAPiResponse>(`${apiUrl}/users/login`, {
			method: "POST",
			body: { ...form },
		});
		const { success, user: data, accessToken, refreshToken } = response;
		if (!success) throw new Error("We couldn't log you in. Please try again.");
		user.value = data;
		if (rememberMe.value) setToken(accessToken, refreshToken);
		else setTemporaryToken(accessToken.token);
		submitting.value = false;
		push.success("Logged in successfully.");
		window.location.href = "/dashboard";
	} catch (error) {
		submitting.value = false;
		push.error("Invalid email or password.");
	}
};
</script>

<template>
	<NuxtLayout name="auth">
		<template #cta>Create Account</template>
		<div class="login__form flex flex-column content-center items-start w-100 h-100">
			<h5 class="login__form-header weight-bold col-black">Welcome Back.</h5>

			<form class="flex flex-column content-center items-center w-100" @submit.prevent="submitForm">
				<BaseInput id="email" v-model="form.email" type="email" label="Email Address" :required="true" />
				<BaseInput id="password" v-model="form.password" type="password" label="Enter Your Password" :required="true" />
				<div class="flex items-center content-between w-100">
					<label for="remember-me" class="flex items-center cursor-pointer" style="gap: 0.5rem">
						<input id="remember-me" type="checkbox" class="mr-1" />
						<span class="weight-regular col-grey">Remember Me</span>
					</label>
					<NuxtLink to="/forget-password" class="col-blue cursor-pointer text-unset">Forgot Password ?</NuxtLink>
				</div>
				<BaseButton :value="submitting ? 'loading' : 'Log In'" />
			</form>
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
}
</style>
