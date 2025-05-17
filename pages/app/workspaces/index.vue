<script lang="ts" setup>
definePageMeta({
	name: "workspaces",
	middleware: [
		() => {
			return navigateTo({ name: "app" });
		},
	],
});
</script>

<template><div /></template>
