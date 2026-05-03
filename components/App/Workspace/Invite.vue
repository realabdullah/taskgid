<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";

import type { Workspace } from "~/types";
import { InviteSchema } from "~/utils/validations";

const props = defineProps<{ workspace: Workspace; renderTrigger?: boolean }>();

const isOpen = defineModel<boolean>();

const isBulkOpen = ref(false);

const formSchema = toTypedSchema(InviteSchema);

const { isFieldDirty, handleSubmit, isSubmitting, resetForm } = useForm({
	validationSchema: formSchema,
	initialValues: { workspaceId: props.workspace.id, email: "", role: undefined },
});

const onSubmit = handleSubmit(async (values) => {
	try {
		const response = await useApiFetch<{ success?: boolean; error?: string; message?: string }>(API_ENDPOINTS.invites.base, {
			method: "POST",
			body: { ...values },
		});

		if (response?.success === false || response?.error) {
			throw new Error(response.error || "Invitation failed");
		}

		toast.success(response?.message || "Invitation sent successfully.");
		resetForm();
		isOpen.value = false;
	} catch (error) {
		toast.error(getServerError(error));
	}
});
</script>

<template>
	<Dialog v-model:open="isOpen">
		<DialogTrigger v-if="renderTrigger" as-child>
			<Button class="rounded-md px-4 py-2">
				<Icon name="hugeicons:plus-sign" :size="16" />
				Add Team Member
			</Button>
		</DialogTrigger>

		<DialogContent class="max-h-[90vh] w-[calc(100vw-1rem)] overflow-y-auto sm:max-w-[425px]">
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
						:options="'options' in field ? field.options : undefined"
						:is-field-dirty="!isFieldDirty"
					/>
				</div>

				<DialogFooter class="flex-col gap-2 sm:flex-row sm:justify-end">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						class="w-full sm:w-auto"
						:disabled="isSubmitting"
						@click="
							isBulkOpen = true;
							isOpen = false;
						"
					>
						<Icon name="hugeicons:mail-send-01" :size="14" class="mr-1" />
						Bulk invite
					</Button>
					<div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
						<Button type="button" variant="outline" class="w-full sm:w-auto" :disabled="isSubmitting" @click="isOpen = false"> Cancel </Button>
						<Button type="submit" class="w-full justify-center whitespace-nowrap sm:w-[11.5rem]" :disabled="isSubmitting" :loading="isSubmitting" loading-label="Sending invitation">
							Send Invitation
						</Button>
					</div>
				</DialogFooter>
			</form>
		</DialogContent>
	</Dialog>

	<AppWorkspaceBulkInviteModal v-model="isBulkOpen" :workspace="workspace" />
</template>
