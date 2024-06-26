<script lang="ts" setup>
definePageMeta({
	title: "Sign Up",
	name: "signup",
	middleware: ["guest"],
});

const route = useRoute();
const { user } = storeToRefs(useStore());
const { setToken } = useToken();

const form = reactive({
	name: "",
	email: "",
	password: "",
});
const submitting = ref(false);
const push = usePush();

const signUp = async () => {
	try {
		submitting.value = true;
		const response = await $fetch<UserAPiResponse>(`${import.meta.env.VITE_API_URL}/auth/create`, {
			method: "POST",
			body: { ...form },
		});
		const { success, user: data, accessToken, refreshToken } = response;
		if (!success) throw new Error("We couldn't create your account. Please try again.");
		user.value = data;
		setToken(accessToken, refreshToken);
		if (route.query.token) await $fetch(`${import.meta.env.VITE_API_URL}/invite/accept`, { method: "POST", body: { token: route.query.token } });
		push.success("Account created successfully.");
		window.location.href = "/dashboard";
	} catch (error) {
		submitting.value = false;
		push.error(useFormatError(error as string));
	}
};
</script>

<template>
	<NuxtLayout name="auth">
		<template #cta>Log In</template>
		<div class="signup__form flex flex-column content-center items-start w-100 h-100">
			<h5 class="signup__form-header col-black weight-bold">Create an Account</h5>
			<p class="signup__form-description">It’s Simpe and Easy!!</p>

			<form class="w-100 flex flex-column content-center items-center" @submit.prevent="signUp">
				<BaseInput id="name" v-model="form.name" type="text" label="Fullname" :required="true" />
				<BaseInput id="email" v-model="form.email" type="email" label="Email Address" />
				<BaseInput id="password" v-model="form.password" type="password" label="Enter A Password" />
				<BaseButton :value="submitting ? 'loading' : 'Create Account'" />
			</form>
		</div>
	</NuxtLayout>
</template>

<style lang="scss" scoped>
.signup__form {
	&-header {
		@include font(3.2rem, 3.8rem);
		margin-bottom: 1.2rem;
		color: var(--dark);
	}

	&-description {
		@include font(1.6rem, 1.9rem);
		margin-bottom: 4.8rem;
		color: var(--text-color);
	}

	form {
		@include gap(2.4rem);
	}
}
</style>
