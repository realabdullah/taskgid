<script setup lang="ts">
import { CommandPalette } from "~/features/navigation";

const { initTheme } = useTheme();
const route = useRoute();

/*
 * Every page's tab reads "<page> · Taskgid", from the short title in its route
 * meta. This lives here rather than in nuxt.config because a function-form
 * titleTemplate there is not serialisable and gets dropped at build time.
 */
useHead({ title: () => (typeof route.meta.title === "string" ? `${route.meta.title} · Taskgid` : "Taskgid — every task keeps its own record") });

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
