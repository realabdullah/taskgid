<script lang="ts" setup>
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { toast } from "vue-sonner";
import type { Workspace } from "~/types";

const { getWorkspaces } = useWorkspaceStore();

const isOpen = ref(false);

const setOpen = (open: boolean) => {
	isOpen.value = open;
};

const formSchema = toTypedSchema(WorkspaceFormSchema);
const { isFieldDirty, handleSubmit } = useForm({
	validationSchema: formSchema,
});

const onSubmit = handleSubmit(async (values) => {
	try {
		const { workspace } = await useApiFetch<{
			workspace: Workspace;
		}>("/workspaces", {
			method: "POST",
			body: { ...values },
		});
		if (!workspace) throw new Error("Failed to create workspace");
		console.log("data", workspace);
		await getWorkspaces();
		setOpen(false);
		toast("Workspace created successfully.");
	} catch (error) {
		toast(String(error));
	}
});
</script>

<template>
	<Dialog :open="isOpen" @update:open="setOpen">
		<DialogTrigger as-child>
			<Button class="bg-black text-white hover:bg-black/90">
				<Icon name="hugeicons:plus-sign" :size="16" class="mr-2" />
				Create Workspace
			</Button>
		</DialogTrigger>
		<DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
			<DialogHeader>
				<DialogTitle>Create workspace</DialogTitle>
				<DialogDescription>Add a new workspace to organize your tasks and team members.</DialogDescription>
			</DialogHeader>

			<form class="" @submit="onSubmit">
				<div class="space-y-4 py-4">
					<AuthFormField label="Workspace name" name="title" placeholder="Acme Inc." type="text" :is-field-dirty="!isFieldDirty" />
					<AuthFormField label="Description" name="description" placeholder="Team workspace for Acme Inc." type="text" :is-field-dirty="!isFieldDirty" />
					<AuthFormField label="Slug" name="slug" placeholder="acme" type="text" :is-field-dirty="!isFieldDirty" />
				</div>

				<DialogFooter>
					<Button variant="outline" @click="setOpen(false)"> Cancel </Button>
					<Button type="submit">Create</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	</Dialog>
</template>
