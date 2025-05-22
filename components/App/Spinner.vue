<script lang="ts" setup>
const { borderColor = "border-gray-900" } = defineProps<{ borderColor?: string }>();
</script>

<template>
	<div class="flex items-center justify-center">
		<div class="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 dark:border-white" :class="[borderColor]"></div>
	</div>
</template>
