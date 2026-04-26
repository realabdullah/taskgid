<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import type { LoginResponse } from "~/types";
import { useApiFetch } from "../../composables/useApiFetch";
import { useStore } from "../../stores";
import { LoginSchema } from "../../utils/validations";

const { user } = storeToRefs(useStore());
const formSchema = toTypedSchema(LoginSchema);

const { isFieldDirty, handleSubmit, isSubmitting } = useForm({
	validationSchema: formSchema,
});

const onSubmit = handleSubmit(async (values) => {
	try {
		const res = await useApiFetch<LoginResponse>(API_ENDPOINTS.auth.login, {
			method: "POST",
			body: { ...values },
		});
		if (!res || !res.accessToken.token) {
			throw new Error("We couldn't sign you in. Check your credentials and try again.");
		}

		toast.success("Welcome back. You're now signed in.");
		const token = useCookie("TG-AUTHTOKEN", { maxAge: res.accessToken.expires });
		token.value = res.accessToken.token;
		user.value = { ...res.user };
		setTimeout(() => {
			navigateTo("/app");
		}, 200);
	} catch (error) {
		toast.error(getServerError(error));
	}
});
</script>

<template>
	<form class="space-y-4" @submit="onSubmit">
		<AuthFormField
			v-for="(field, index) in loginFormFields"
			:key="index"
			:name="field.id"
			:label="field.label"
			:type="field.type"
			:placeholder="field.placeholder"
			:is-field-dirty="!isFieldDirty"
		/>
		<slot :is-submitting="isSubmitting" />
	</form>
</template>
