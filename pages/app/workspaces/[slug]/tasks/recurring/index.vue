<script lang="ts" setup>
import { RecurringTasksPage } from "~/features/recurrence";

definePageMeta({
	name: "tasks-recurring",
	title: "Recurring tasks",
	layout: "workspace",
});
</script>

<template>
	<RecurringTasksPage />
</template>
