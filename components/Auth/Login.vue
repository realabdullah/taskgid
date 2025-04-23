<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import type { LoginResponse } from "~/types";

const formSchema = toTypedSchema(LoginSchema);

const { isFieldDirty, handleSubmit } = useForm({
	validationSchema: formSchema,
});

const onSubmit = handleSubmit(async (values) => {
	try {
		const res = await useApiFetch<LoginResponse>("/auth/login", {
			method: "POST",
			body: { ...values },
		});
		if (!res || !res.accessToken.token) throw new Error("Login failed");
		toast("Authentication successful. You're now logged in.");
		const token = useCookie("TG-AUTHTOKEN", { maxAge: res.accessToken.expires });
		token.value = res.accessToken.token;
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
			v-for="(field, index) in loginFormFields"
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
