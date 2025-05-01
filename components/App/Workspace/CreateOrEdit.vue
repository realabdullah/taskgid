<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import type { Workspace } from "~/types";

const props = defineProps<{ isCreating?: boolean; workspace?: Workspace }>();
const emits = defineEmits<(event: "update", value: Workspace) => void>();

const { getWorkspaces } = useWorkspacesStore();

const isOpen = defineModel<boolean>();

const setOpen = (open: boolean) => {
	isOpen.value = open;
};

const formSchema = toTypedSchema(WorkspaceFormSchema);
const { isFieldDirty, handleSubmit } = useForm({
	validationSchema: formSchema,
	initialValues: {
		title: props.workspace?.title,
		description: props.workspace?.description,
		slug: props.workspace?.slug,
	},
});

const onSubmit = handleSubmit(async (values) => {
	try {
		const url = props.isCreating ? "/workspaces" : `/workspaces/${props.workspace?.slug}`;
		const { workspace: data } = await useApiFetch<{
			workspace: Workspace;
		}>(url, {
			method: props.isCreating ? "POST" : "PUT",
			body: { ...values },
		});
		if (!data) throw new Error(props.isCreating ? "Failed to create workspace" : "Failed to update workspace");
		if (props.isCreating) await getWorkspaces();
		else emits("update", data);
		setOpen(false);
		toast(props.isCreating ? "Workspace created successfully." : "Workspace updated successfully.");
	} catch (error) {
		toast(String(error));
	}
});
</script>

<template>
	<Dialog :open="isOpen" @update:open="setOpen">
		<DialogTrigger v-if="isCreating" as-child>
			<Button class="bg-black text-white hover:bg-black/90">
				<Icon name="hugeicons:plus-sign" :size="16" class="mr-2" />
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
					<AuthFormField label="Workspace name" name="title" placeholder="Acme Inc." type="text" :is-field-dirty="!isFieldDirty" />
					<AuthFormField label="Description" name="description" placeholder="Team workspace for Acme Inc." type="text" :is-field-dirty="!isFieldDirty" />
					<AuthFormField label="Slug" name="slug" placeholder="acme" type="text" :is-field-dirty="!isFieldDirty" />
				</div>

				<DialogFooter>
					<Button type="button" variant="outline" @click="setOpen(false)"> Cancel </Button>
					<Button type="submit">{{ isCreating ? "Create" : "Update" }}</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	</Dialog>
</template>
