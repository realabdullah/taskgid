<script lang="ts" setup>
definePageMeta({
	name: "tasks",
	layout: "workspace",
});
</script>

<template>
	<div class="flex flex-1 flex-col gap-4 p-4 pt-0">These are the tasks for the workspace - {{ $route.params.slug }}.</div>
</template>
