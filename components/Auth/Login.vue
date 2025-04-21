<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";

const formSchema = toTypedSchema(LoginSchema);

const { isFieldDirty, handleSubmit } = useForm({
	validationSchema: formSchema,
});

const onSubmit = handleSubmit((values) => {
	toast("Form submitted successfully!");
	console.log("Form values:", values);
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
