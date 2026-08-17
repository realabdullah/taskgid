<script setup lang="ts">
import { AuthExperience } from "~/features/auth";

definePageMeta({ layout: "auth", name: "login", title: "Sign in" });
</script>

<template>
	<AuthExperience initial-mode="login" />
</template>
