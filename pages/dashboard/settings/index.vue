<script lang="ts" setup>
definePageMeta({
	title: "Settings - Dashboard",
	name: "Settings",
	middleware: ["auth"],
});
</script>

<template>
    <NuxtLayout name="dashboard">
        <h1>Settings!!</h1>
    </NuxtLayout>
</template>
