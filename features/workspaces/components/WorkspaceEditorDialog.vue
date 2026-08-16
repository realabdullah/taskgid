<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import type { Workspace } from "~/types";
import { useWorkspacesStore } from "~/features/workspaces/stores/workspaces";

const props = defineProps<{ isCreating?: boolean; workspace?: Workspace; hideTrigger?: boolean }>();
const emits = defineEmits<(event: "update", value: Workspace) => void>();

const { getWorkspaces } = useWorkspacesStore();

const isOpen = defineModel<boolean>();

const setOpen = (open: boolean) => {
	isOpen.value = open;
};

const formSchema = toTypedSchema(WorkspaceFormSchema);
const { isFieldDirty, handleSubmit, isSubmitting } = useForm({
	validationSchema: formSchema,
	initialValues: {
		title: props.workspace?.title,
		description: props.workspace?.description,
		slug: props.workspace?.slug,
	},
});

const onSubmit = handleSubmit(async (values) => {
	try {
		const url = props.isCreating ? API_ENDPOINTS.workspaces.base : API_ENDPOINTS.workspaces.bySlug(props.workspace?.slug);
		const { workspace: data } = await useApiFetch<{
			workspace: Workspace;
		}>(url, {
			method: props.isCreating ? "POST" : "PUT",
			body: { ...values },
		});
		if (!data) throw new Error(props.isCreating ? "Unable to create the workspace. Try again." : "Unable to update the workspace. Try again.");
		if (props.isCreating) await getWorkspaces();
		else emits("update", data);
		setOpen(false);
		toast.success(props.isCreating ? "Workspace created." : "Workspace updated.");
	} catch (error) {
		toast.error(getServerError(error));
	}
});
</script>

<template>
	<Dialog :open="isOpen" @update:open="setOpen">
		<DialogTrigger v-if="isCreating && !hideTrigger" as-child>
			<Button>
				<Icon name="hugeicons:plus-sign" :size="16" class="me-2" />
				Create Workspace
			</Button>
		</DialogTrigger>
		<DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
			<DialogHeader>
				<DialogTitle>{{ isCreating ? "Create workspace" : "Update workspace" }}</DialogTitle>
				<DialogDescription>
					{{ isCreating ? "Add a new workspace to organize your tasks and team members." : "Edit your workspace details to better organize tasks and collaborate with your team." }}
				</DialogDescription>
			</DialogHeader>

			<form class="" @submit="onSubmit">
				<div class="space-y-4 py-4">
					<FormFieldRenderer label="Workspace name" name="title" placeholder="Acme Inc." type="text" :is-field-dirty="!isFieldDirty" />
					<FormFieldRenderer label="Description" name="description" placeholder="Team workspace for Acme Inc." type="text" :is-field-dirty="!isFieldDirty" />
					<FormFieldRenderer label="Workspace address" name="slug" placeholder="acme" type="text" :is-field-dirty="!isFieldDirty" />
				</div>

				<DialogFooter>
					<Button type="button" variant="outline" :disabled="isSubmitting" @click="setOpen(false)"> Cancel </Button>
					<Button type="submit" :disabled="isSubmitting" :loading="isSubmitting" :loading-label="isCreating ? 'Creating workspace' : 'Updating workspace'">
						{{ isCreating ? "Create" : "Update" }}
					</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	</Dialog>
</template>
