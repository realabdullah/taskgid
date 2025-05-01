<script setup lang="ts">
import { toast } from "vue-sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const props = defineProps<{ isOpen: boolean; slug?: string }>();
const emits = defineEmits<{
	(event: "delete-action", value: boolean | string): void;
}>();

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
	<AlertDialog :open="isOpen">
		<AlertDialogContent>
			<AlertDialogHeader>
				<AlertDialogTitle>Delete workspace?</AlertDialogTitle>
				<AlertDialogDescription> This will remove everything in the workspace — tasks, settings, and members. This cannot be undone. </AlertDialogDescription>
			</AlertDialogHeader>
			<AlertDialogFooter>
				<AlertDialogCancel @click="emits('delete-action', false)">Cancel</AlertDialogCancel>
				<AlertDialogAction class="bg-red-500" @click="deleteWorkspace">Continue</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	</AlertDialog>
</template>
