<script lang="ts" setup>
import { DashboardHome } from "~/features/dashboard";

definePageMeta({
	name: "app",
	title: "Dashboard",
	description: "Taskgid — Tasks, in view.",
	layout: "workspace",
});
</script>

<template>
	<DashboardHome />
</template>
