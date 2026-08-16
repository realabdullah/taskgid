<script setup lang="ts">
import { AuthExperience } from "~/features/auth";

definePageMeta({ layout: "auth", name: "signup" });
</script>

<template>
	<AuthExperience initial-mode="signup" />
</template>
