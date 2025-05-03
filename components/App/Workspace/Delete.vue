<script setup lang="ts">
import { toast } from "vue-sonner";

const props = defineProps<{ slug?: string }>();
const emits = defineEmits<(event: "delete-action", value: boolean | string) => void>();

const isOpen = defineModel<boolean>();

const deleteWorkspace = async () => {
	const { success } = await useApiFetch<{ success: boolean }>(`/workspaces/${props.slug}`, { method: "DELETE" });
	if (!success) {
		toast("Failed to delete workspace");
		return;
	}

	toast("Workspace deleted successfully.");
	emits("delete-action", props.slug || "");
};
</script>

<template>
	<AppDeleteAction
		v-model="isOpen"
		title="Delete workspace?"
		description="This will remove everything in the workspace — tasks, settings, and members. This cannot be undone."
		@cancel="emits('delete-action', false)"
		@confirm="deleteWorkspace"
	/>
</template>
