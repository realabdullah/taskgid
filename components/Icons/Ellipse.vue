<script lang="ts" setup>
defineProps<{
	variant: string;
}>();
</script>

<template>
	<svg v-if="variant === 'outline'" width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle cx="15" cy="15" r="14" stroke="#3754DB" stroke-width="2" />
	</svg>

	<svg v-else-if="variant === 'solid'" width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle cx="15" cy="15" r="14" stroke="#3754DB" stroke-width="2" />
		<circle cx="15" cy="15" r="10" fill="#6684FF" />
	</svg>
</template>
