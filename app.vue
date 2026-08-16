<script setup lang="ts">
import { CommandPalette } from "~/features/navigation";

const { initTheme } = useTheme();
onMounted(initTheme);
</script>

<template>
	<NuxtLayout>
		<Toaster />
		<CommandPalette />
		<NuxtRouteAnnouncer />
		<NuxtPage />
	</NuxtLayout>
</template>
