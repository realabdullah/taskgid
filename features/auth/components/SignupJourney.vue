<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { storeToRefs } from "pinia";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";

import { useApiFetch } from "~/composables/useApiFetch";
import { useStore } from "~/stores";
import type { SignupResponse } from "~/types";
import { API_ENDPOINTS } from "~/utils/endpoints";
import { getServerError } from "~/utils";
import { SignupSchema } from "~/utils/validations";

const emit = defineEmits<{ back: []; preview: [name: string] }>();
const { user } = storeToRefs(useStore());
const step = ref<1 | 2>(1);
const acceptedTerms = ref(false);

const { handleSubmit, isSubmitting, validateField, values } = useForm({
	validationSchema: toTypedSchema(SignupSchema),
	keepValuesOnUnmount: true,
});

const continueToAccount = async () => {
	const [firstName, lastName] = await Promise.all([validateField("firstName"), validateField("lastName")]);
	if (firstName.valid && lastName.valid) step.value = 2;
};

watch(
	() => values.firstName,
	(firstName) => emit("preview", String(firstName || "Ada").trim() || "Ada"),
	{ immediate: true }
);

const onSubmit = handleSubmit(async (formValues) => {
	if (!acceptedTerms.value) {
		toast.error("Accept the terms of service and privacy policy to continue.");
		return;
	}

	try {
		const response = await useApiFetch<SignupResponse>(API_ENDPOINTS.auth.register, { method: "POST", body: formValues });
		if (!response?.accessToken.token) throw new Error("Unable to create your account. Try again.");

		const token = useCookie("TG-AUTHTOKEN", { maxAge: response.accessToken.expiresIn });
		token.value = response.accessToken.token;
		user.value = response.user;
		toast.success("Account created. Create your first workspace to get started.");
		await navigateTo("/app");
	} catch (error) {
		toast.error(getServerError(error));
	}
});
</script>

<template>
	<form class="space-y-5" @submit="onSubmit">
		<div class="flex items-center gap-2" aria-label="Account creation progress">
			<span class="bg-primary h-1 flex-1 rounded-full" />
			<span class="h-1 flex-1 rounded-full transition-colors" :class="step === 2 ? 'bg-primary' : 'bg-surface-2'" />
			<span class="text-text-tertiary ms-2 text-xs font-medium tabular-nums">{{ step }}/2</span>
		</div>

		<Transition
			mode="out-in"
			enter-active-class="transition duration-200 ease-out"
			leave-active-class="transition duration-150 ease-in"
			enter-from-class="translate-x-2 opacity-0"
			leave-to-class="-translate-x-2 opacity-0"
		>
			<div v-if="step === 1" key="identity" class="space-y-4">
				<div>
					<h2 class="text-text-primary text-xl font-semibold tracking-[-0.03em]">First, what should we call you?</h2>
					<p class="text-text-tertiary mt-1.5 text-sm">This is how teammates will see you in Taskgid.</p>
				</div>
				<div class="grid gap-4 sm:grid-cols-2">
					<FormFieldRenderer name="firstName" label="First name" type="text" placeholder="Ada" />
					<FormFieldRenderer name="lastName" label="Last name" type="text" placeholder="Lovelace" />
				</div>
				<Button type="button" class="h-11 w-full" @click="continueToAccount">Continue <Icon name="lucide:arrow-right" :size="16" /></Button>
			</div>

			<div v-else key="account" class="space-y-4">
				<div>
					<h2 class="text-text-primary text-xl font-semibold tracking-[-0.03em]">Secure your account.</h2>
					<p class="text-text-tertiary mt-1.5 text-sm">Next, you’ll create your first workspace.</p>
				</div>
				<FormFieldRenderer name="username" label="Username" type="text" placeholder="adalovelace" />
				<FormFieldRenderer name="email" label="Work email" type="email" placeholder="ada@example.com" />
				<FormFieldRenderer name="password" label="Password" type="password" placeholder="At least 8 characters" />
				<label class="text-text-secondary flex items-start gap-2.5 text-xs leading-5">
					<Checkbox v-model="acceptedTerms" class="mt-0.5" />
					<span>I agree to the terms of service and privacy policy.</span>
				</label>
				<div class="flex gap-2">
					<Button type="button" variant="secondary" class="h-11" @click="step = 1"><Icon name="lucide:arrow-left" :size="16" /><span class="sr-only">Back</span></Button>
					<Button type="submit" class="h-11 flex-1" :disabled="isSubmitting" :loading="isSubmitting" loading-label="Creating account">Create account</Button>
				</div>
				<p class="text-text-tertiary text-center text-xs">Creating an account for {{ values.firstName || "you" }} {{ values.lastName || "" }}</p>
			</div>
		</Transition>

		<Button type="button" variant="link" size="inline" static class="text-text-secondary hover:text-text-primary mx-auto block text-sm" @click="emit('back')">
			Already have an account? <span class="text-primary font-medium">Sign in</span>
		</Button>
	</form>
</template>
