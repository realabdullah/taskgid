<script setup lang="ts">
const { initTheme } = useTheme();
onMounted(initTheme);
</script>

<template>
	<NuxtLayout>
		<Toaster />
		<AppCommandPalette />
		<NuxtRouteAnnouncer />
		<NuxtPage />
	</NuxtLayout>
</template>
