<script setup lang="ts">
import { AuthExperience } from "~/features/auth";

definePageMeta({ layout: "auth", name: "signup" });

const route = useRoute();
const initialEmail = computed(() => (typeof route.query.email === "string" ? route.query.email : undefined));
</script>

<template>
	<AuthExperience initial-mode="signup" :initial-email="initialEmail" />
</template>
