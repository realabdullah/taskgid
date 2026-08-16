<script lang="ts" setup>
withDefaults(defineProps<{ title: string; description: string; confirmLabel?: string }>(), {
	confirmLabel: "Delete",
});
const emits = defineEmits<(event: "cancel" | "confirm") => void>();

const isOpen = defineModel<boolean>();
</script>

<template>
	<AlertDialog :open="isOpen">
		<AlertDialogContent>
			<AlertDialogHeader>
				<AlertDialogTitle>{{ title }}</AlertDialogTitle>
				<AlertDialogDescription>{{ description }}</AlertDialogDescription>
			</AlertDialogHeader>
			<AlertDialogFooter>
				<AlertDialogCancel @click="emits('cancel')">Cancel</AlertDialogCancel>
				<AlertDialogAction class="bg-danger text-destructive-foreground hover:bg-danger/90" @click="emits('confirm')">{{ confirmLabel }}</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	</AlertDialog>
</template>
