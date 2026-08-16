<script setup lang="ts">
import { AuthExperience } from "~/features/auth";

definePageMeta({ layout: "auth", name: "login" });
</script>

<template>
	<AuthExperience initial-mode="login" />
</template>
