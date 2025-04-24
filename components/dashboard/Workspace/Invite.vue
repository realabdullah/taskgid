<script lang="ts" setup>
import * as z from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import type { Workspace } from "~/types";

const props = defineProps<{ workspace: Workspace }>();

const isOpen = defineModel<boolean>();

const formSchema = toTypedSchema(
	z.object({
		workspaceId: z.string().uuid("Invalid workspace ID"),
		email: z.string().email("Invalid email address"),
	})
);

const { isFieldDirty, handleSubmit } = useForm({ validationSchema: formSchema, initialValues: { workspaceId: props.workspace.id, email: "" } });

const onSubmit = handleSubmit(async (values) => {
	try {
		const { success, error } = await useApiFetch<{ success: boolean; error?: string }>("/invite", {
			method: "POST",
			body: { ...values },
		});
		if (!success || error) throw new Error(error || "Invitation failed");
		toast("Invitation sent successfully.");
		isOpen.value = false;
	} catch (error) {
		toast(String(error));
	}
});
</script>

<template>
	<Dialog :open="isOpen" @update:open="isOpen = $event">
		<DialogContent class="sm:max-w-[425px]">
			<DialogHeader>
				<DialogTitle>Invite Team Member</DialogTitle>
				<DialogDescription>Invite a new member to join the "{{ workspace.title }}" workspace.</DialogDescription>
			</DialogHeader>

			<form class="space-y-6 py-4" @submit="onSubmit">
				<div class="space-y-4">
					<AuthFormField
						v-for="(field, index) in inviteFormFields"
						:key="index"
						:name="field.id"
						:label="field.label"
						:type="field.type"
						:placeholder="field.placeholder"
						:is-field-dirty="!isFieldDirty"
					/>
				</div>

				<DialogFooter>
					<Button type="button" variant="outline" @click="isOpen = false"> Cancel </Button>
					<Button type="submit" class="bg-black text-white hover:bg-black/90"> Send Invitation </Button>
				</DialogFooter>
			</form>
		</DialogContent>
	</Dialog>
</template>
