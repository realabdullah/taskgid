<script lang="ts" setup>
definePageMeta({
	name: "workspaces",
	title: "Workspaces",
	middleware: [
		() => {
			return navigateTo({ name: "app" });
		},
	],
});
</script>

<template><div /></template>
