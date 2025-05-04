<script lang="ts" setup>
defineProps<{ title: string; description: string; action?: string }>();
defineEmits<(event: "create") => void>();
</script>

<template>
	<div class="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
		<div class="bg-muted rounded-full p-4">
			<Icon name="hugeicons:folder-02" :size="40" class="text-muted-foreground" />
		</div>

		<h3 class="mt-4 text-lg font-medium">{{ title }}</h3>

		<p class="text-muted-foreground mt-2 max-w-sm text-sm">{{ description }}</p>

		<Button v-if="action" class="mt-4 bg-black text-white hover:bg-black/90" @click="$emit('create')">
			<Icon name="hugeicons:plus-sign" :size="16" class="mr-2" />
			{{ action }}
		</Button>
	</div>
</template>
