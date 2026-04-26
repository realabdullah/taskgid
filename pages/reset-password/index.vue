<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";

definePageMeta({ layout: "auth", name: "reset-password" });

// Reset links sent via email target /reset-password?token=... — redirect to the
// confirmation page which handles the token + new password form.
const route = useRoute();
if (route.query.token) {
	await navigateTo({ path: "/reset-confirmation", query: { token: route.query.token } }, { replace: true });
}

const formSchema = toTypedSchema(ResetPasswordSchema);

const { isFieldDirty, handleSubmit } = useForm({
	validationSchema: formSchema,
});

const isSubmitting = ref(false);

const onSubmit = handleSubmit(async (values) => {
	try {
		isSubmitting.value = true;
		const { success, error, message } = await useApiFetch<{ success: boolean; error?: string; message?: string }>(API_ENDPOINTS.auth.forgotPassword, {
			method: "POST",
			body: { email: values.email },
		});
		if (!success || error) {
			throw new Error(error || message || "Failed to send reset link");
		}
		toast.success(message || "If an account exists for this email, a reset link has been sent.");
	} catch (error) {
		toast.error(getServerError(error));
	} finally {
		isSubmitting.value = false;
	}
});
</script>

<template>
	<div class="grid gap-4">
		<form class="space-y-4" @submit="onSubmit">
			<AuthFormField name="email" label="Email Address" type="email" placeholder="name@example.com" :is-field-dirty="!isFieldDirty" />
			<Button class="w-full" :disabled="isSubmitting">
				{{ isSubmitting ? "Sending Link..." : "Send Reset Link" }}
			</Button>
		</form>

		<p class="text-text-secondary text-center text-sm">Use the link from your email to continue resetting your password.</p>

		<p class="text-muted-foreground px-8 text-center text-sm">
			Remember your password?
			<NuxtLink to="/" class="text-primary font-medium underline-offset-4 hover:underline"> Back to sign in </NuxtLink>
		</p>
	</div>
</template>
