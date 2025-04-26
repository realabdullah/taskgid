<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import type { SignupResponse } from "~/types";

const { user } = storeToRefs(useStore());
const formSchema = toTypedSchema(SignupSchema);

const { isFieldDirty, handleSubmit } = useForm({
	validationSchema: formSchema,
});

const onSubmit = handleSubmit(async (values) => {
	try {
		const res = await useApiFetch<SignupResponse>("/auth/register", {
			method: "POST",
			body: { ...values },
		});
		if (!res || !res.accessToken.token) throw new Error("Signup failed");
		toast("Account created. Let's get you started!");
		const token = useCookie("TG-AUTHTOKEN", { maxAge: res.accessToken.expiresIn });
		token.value = res.accessToken.token;
		user.value = { ...res.user };
		setTimeout(() => {
			navigateTo("/app");
		}, 200);
	} catch (error) {
		toast(String(error));
	}
});
</script>

<template>
	<form class="space-y-6" @submit="onSubmit">
		<AuthFormField
			v-for="(field, index) in signupFormFields"
			:key="index"
			:name="field.id"
			:label="field.label"
			:type="field.type"
			:placeholder="field.placeholder"
			:is-field-dirty="!isFieldDirty"
		/>
		<slot />
	</form>
</template>
