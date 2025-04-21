<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";

definePageMeta({ layout: "auth", name: "reset-confirmation" });

const formSchema = toTypedSchema(ResetPasswordConfirmationSchema);

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
			<AuthFormField
				v-for="field in resetConfirmationFields"
				:key="field.id"
				:name="field.id"
				:label="field.label"
				:type="field.type"
				:placeholder="field.placeholder"
				:is-field-dirty="!isFieldDirty"
			/>
			<Button class="w-full"> Reset Password </Button>
		</form>

		<p class="text-muted-foreground px-8 text-center text-sm">
			Remember your password?
			<NuxtLink to="/login" class="text-primary font-medium underline-offset-4 hover:underline"> Back to login </NuxtLink>
		</p>
	</div>
</template>
