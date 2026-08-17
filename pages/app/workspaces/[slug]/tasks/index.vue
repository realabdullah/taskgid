<script lang="ts" setup>
import { TaskWorkbench } from "~/features/tasks";

definePageMeta({
	name: "tasks",
	title: "Tasks",
	layout: "workspace",
});
</script>

<template>
	<TaskWorkbench />
</template>
