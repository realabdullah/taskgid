<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";

import type { Workspace } from "~/types";
import { InviteSchema } from "~/utils/validations";
import WorkspaceBulkInviteDialog from "./WorkspaceBulkInviteDialog.vue";

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
			throw new Error(response.error || "Unable to send the invitation. Check the email address and try again.");
		}

		toast.success(response?.message || "Invitation sent.");
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
			<Button class="px-4 py-2">
				<Icon name="hugeicons:plus-sign" :size="16" />
				Add Team Member
			</Button>
		</DialogTrigger>

		<DialogContent class="border-border max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] overflow-hidden border p-0 sm:max-w-[560px]">
			<DialogHeader class="border-border bg-surface-1 border-b px-6 py-5 pe-14 sm:px-7">
				<p class="text-text-tertiary font-mono text-xs font-semibold tracking-[0.14em] uppercase">Team access</p>
				<DialogTitle class="mt-2 text-2xl font-bold tracking-[-0.03em]">Invite someone</DialogTitle>
				<DialogDescription class="text-text-secondary mt-2 text-sm">Send an invitation to join {{ workspace.title }}.</DialogDescription>
			</DialogHeader>

			<form class="min-h-0 space-y-5 overflow-y-auto p-6 sm:p-7" @submit="onSubmit">
				<div class="space-y-4">
					<FormFieldRenderer
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

				<DialogFooter class="border-border flex-col gap-2 border-t pt-5 sm:flex-row sm:justify-end">
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
						<Icon name="hugeicons:mail-send-01" :size="14" class="me-1" />
						Bulk invite
					</Button>
					<div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
						<Button type="button" variant="outline" class="w-full sm:w-auto" :disabled="isSubmitting" @click="isOpen = false"> Cancel </Button>
						<Button type="submit" class="w-full justify-center whitespace-nowrap sm:w-auto" :disabled="isSubmitting" :loading="isSubmitting" loading-label="Sending invitation">
							Send Invitation
						</Button>
					</div>
				</DialogFooter>
			</form>
		</DialogContent>
	</Dialog>

	<WorkspaceBulkInviteDialog v-model="isBulkOpen" :workspace="workspace" />
</template>
