<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";

definePageMeta({ layout: "auth", name: "reset-password" });

const formSchema = toTypedSchema(ResetPasswordSchema);

const { isFieldDirty, handleSubmit } = useForm({
	validationSchema: formSchema,
});

const onSubmit = handleSubmit((values) => {
	toast("Form submitted successfully!");
	console.log("Form values:", values);
});
</script>

<template>
	<div class="grid gap-4">
		<form class="space-y-4" @submit="onSubmit">
			<AuthFormField name="email" label="Email Address" type="email" placeholder="name@example.com" :is-field-dirty="!isFieldDirty" />
			<Button class="w-full"> Send Reset Link </Button>
		</form>

		<p class="text-muted-foreground px-8 text-center text-sm">
			Remember your password?
			<NuxtLink to="/login" class="text-primary font-medium underline-offset-4 hover:underline"> Back to login </NuxtLink>
		</p>
	</div>
</template>
