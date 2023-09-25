<script lang="ts" setup>
definePageMeta({
	title: "Sign Up",
	name: "signup",
	middleware: ["guest"],
});

const form = reactive({
	name: "",
	email: "",
	password: "",
});
const submitting = ref(false);
const submissionError = ref("");

const client = useSupabaseAuthClient();
const { sendWelcomeEmail } = useEmail();

const signUp = async () => {
	try {
		submitting.value = true;
		const { data, error } = await client.auth.signUp({
			email: form.email,
			password: form.password,
		});

		if (error) throw new Error(error.message);

		const username = form.email.split("@")[0] + Math.floor(Math.random() * 1000) + 1;
		const dp = `https://ui-avatars.com/api/?name=${form.name}&background=random&color=fff`;

		const payload = { id: data.user?.id, name: form.name, email: form.email, username, profile_picture: dp };

		const { error: userError } = await useSupabaseClient()
			.from("users")
			.insert(payload as any);

		if (userError) throw new Error(userError.message);

		await sendWelcomeEmail(form.email, form.name);

		navigateTo({ name: "home", replace: true });
	} catch (error) {
		submissionError.value = useFormatError(error as string);
		submitting.value = false;
		setTimeout(() => {
			submissionError.value = "";
		}, 2000);
	}
};
</script>

<template>
	<NuxtLayout name="auth">
		<BaseToast v-if="!!submissionError" toast-style="solid" type="error" message="Sign up error!" :description="submissionError" />
		<template #cta>Log In</template>
		<div class="signup__form d-flex fd-column jc-center ai-flex-start w-100 h-100">
			<h5 class="signup__form-header col-black fw-bold">Create an Account</h5>
			<p class="signup__form-description col-grey">It’s Simpe and Easy!!</p>

			<form class="w-100 flex fd-column jc-center ai-center" @submit.prevent="signUp">
				<BaseInput
					v-model="form.name"
					input-type="text"
					label-for="name"
					label="Fullname"
					placeholder="Enter fullname"
					hint="Information about the input"
					border-color="#2746D8"
					:required="true" />

				<BaseInput
					v-model="form.email"
					input-type="email"
					label-for="email"
					label="Email Address"
					placeholder="Enter email address"
					hint="Example. mano@gmail.com"
					border-color="#2746D8"
					:required="true" />

				<BaseInput
					v-model="form.password"
					input-type="password"
					label-for="password"
					label="Enter A Password"
					placeholder="Password"
					hint="Upto 8 characters with an Uppercase, symbol and number"
					border-color="#2746D8"
					:required="true" />

				<BaseButton width="100%" :value="submitting ? 'loading' : 'Create Account'" background="#3754DB" color="#FFFFFF" />
			</form>
		</div>
	</NuxtLayout>
</template>

<style lang="scss" scoped>
.signup__form {
	max-width: 40rem;

	@media screen and (max-width: 787px) {
		max-width: 100%;
		padding: 0 2rem;
	}

	&-header {
		@include font(3.2rem, 3.8rem);
		margin-bottom: 1.2rem;
	}

	&-description {
		@include font(1.6rem, 1.9rem);
		margin-bottom: 4.8rem;
	}

	small {
		margin: 1.6rem auto 0;
		@include font(1.2rem, 1.4rem);
	}
}
</style>
