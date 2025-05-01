<script lang="ts" setup>
defineEmits<(event: "create") => void>();
</script>

<template>
	<div class="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
		<div class="bg-muted rounded-full p-4">
			<Icon name="hugeicons:folder-02" :size="40" class="text-muted-foreground" />
		</div>

		<h3 class="mt-4 text-lg font-medium">No workspaces yet</h3>

		<p class="text-muted-foreground mt-2 max-w-sm text-sm">Create your first workspace to start organizing your tasks and collaborating with your team.</p>

		<Button class="mt-4 bg-black text-white hover:bg-black/90" @click="$emit('create')">
			<Icon name="hugeicons:plus-sign" :size="16" class="mr-2" />
			Create Workspace
		</Button>
	</div>
</template>
