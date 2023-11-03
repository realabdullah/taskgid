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

const client = useSupabaseAuthClient();
const { sendWelcomeEmail } = useEmail();
const push = usePush();

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
		push.success("Account created successfully.");
		navigateTo({ name: "home", replace: true });
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
			<p class="signup__form-description col-grey">It’s Simpe and Easy!!</p>

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
	}

	&-description {
		@include font(1.6rem, 1.9rem);
		margin-bottom: 4.8rem;
	}

	form {
		@include gap(2.4rem);
	}
}
</style>
