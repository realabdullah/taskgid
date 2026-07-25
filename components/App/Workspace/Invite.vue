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
			<Button class="px-4 py-2">
				<Icon name="hugeicons:plus-sign" :size="16" />
				Add Team Member
			</Button>
		</DialogTrigger>

		<DialogContent class="border-border max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] overflow-x-hidden overflow-y-auto rounded-none border p-0 sm:max-w-[560px]">
			<DialogHeader class="bg-rail px-6 py-5 pr-14 text-white sm:px-7">
				<p class="text-sidebar-foreground/55 font-mono text-[10px] font-semibold tracking-[0.14em] uppercase">Team access</p>
				<DialogTitle class="mt-2 text-2xl font-bold tracking-[-0.03em]">Invite a collaborator.</DialogTitle>
				<DialogDescription class="text-sidebar-foreground/65 mt-2 text-sm">Give someone a clear place in {{ workspace.title }}.</DialogDescription>
			</DialogHeader>

			<form class="space-y-5 p-6 sm:p-7" @submit="onSubmit">
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
						<Icon name="hugeicons:mail-send-01" :size="14" class="mr-1" />
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

	<AppWorkspaceBulkInviteModal v-model="isBulkOpen" :workspace="workspace" />
</template>
