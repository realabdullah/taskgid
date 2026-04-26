<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";

definePageMeta({ layout: "auth", name: "reset-confirmation" });

const route = useRoute();
const router = useRouter();

const formSchema = toTypedSchema(ResetPasswordConfirmationSchema);

const { isFieldDirty, handleSubmit } = useForm({
	validationSchema: formSchema,
});

const isSubmitting = ref(false);
const resetToken = computed(() => (typeof route.query.token === "string" ? route.query.token.trim() : ""));

const onSubmit = handleSubmit(async (values) => {
	if (!resetToken.value) {
		toast.error("Your reset link is missing a token. Request a new password reset link.");
		return;
	}

	try {
		isSubmitting.value = true;
		const { success, error, message } = await useApiFetch<{ success: boolean; error?: string; message?: string }>(API_ENDPOINTS.auth.resetPassword, {
			method: "POST",
			body: {
				token: resetToken.value,
				password: values.password,
			},
		});
		if (!success || error) {
			throw new Error(error || message || "Failed to reset password");
		}
		toast.success(message || "Password reset successful. Sign in with your new password.");
		await router.push("/");
	} catch (error) {
		toast.error(String(error));
	} finally {
		isSubmitting.value = false;
	}
});
</script>

<template>
	<div class="grid gap-4">
		<div v-if="!resetToken" class="bg-danger/10 text-danger border-danger/20 rounded-md border px-3 py-2 text-sm">
			Invalid or expired reset link. Request a new one from the forgot password page.
		</div>

		<form class="space-y-4" @submit="onSubmit">
			<AuthFormField
				v-for="field in resetConfirmationFields"
				:key="field.id"
				:name="field.id"
				:label="field.label"
				:type="field.type"
				:placeholder="field.placeholder"
				:is-field-dirty="!isFieldDirty"
			/>
			<Button class="w-full" :disabled="isSubmitting || !resetToken">
				{{ isSubmitting ? "Resetting Password..." : "Reset Password" }}
			</Button>
		</form>

		<p class="text-muted-foreground px-8 text-center text-sm">
			Remember your password?
			<NuxtLink to="/" class="text-primary font-medium underline-offset-4 hover:underline"> Back to sign in </NuxtLink>
		</p>
	</div>
</template>
