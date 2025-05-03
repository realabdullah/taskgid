<script lang="ts" setup>
defineProps<{ title: string; description: string }>();
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
				<AlertDialogAction class="bg-red-500" @click="emits('confirm')">Continue</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	</AlertDialog>
</template>
