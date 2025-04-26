<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";

const emits = defineEmits<{
	(e: "close"): void;
}>();

const formSchema = toTypedSchema(updateAccountSchema);

const { isFieldDirty, handleSubmit } = useForm({
	validationSchema: formSchema,
});

const onSubmit = handleSubmit(async (values) => {
	try {
		const { success, error, message } = await useApiFetch<{ success: boolean; error?: string; message?: string }>("/users/profile", {
			method: "PATCH",
			body: { ...values },
		});
		if (!success || error) throw new Error(error || message || "Failed to update login information");
		toast(message || "Login information updated successfully");
		emits("close");
	} catch (error) {
		toast(String(error));
	}
});
</script>

<template>
	<div class="space-y-4">
		<h3 class="flex items-center gap-2 text-lg font-medium">
			<Icon name="hugeicons:key-01" :size="20" />
			Login Information
		</h3>

		<form class="grid gap-4" @submit="onSubmit">
			<AuthFormField
				v-for="(field, index) in updateAccountFields"
				:key="index"
				:name="field.id"
				:label="field.label"
				:type="field.type"
				:placeholder="field.placeholder"
				:is-field-dirty="!isFieldDirty"
			/>

			<slot />
		</form>
	</div>
</template>
