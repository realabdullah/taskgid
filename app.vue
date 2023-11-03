<script lang="ts" setup>
import { lightTheme, type NotivueTheme } from "notivue";

const theme: NotivueTheme = {
	...lightTheme,
	"--nv-spacing": "1rem",
	"--nv-icon-size": "2rem",
	"--nv-message-size": "1.6rem",
};
</script>

<template>
	<Notivue v-slot="item">
		<Notifications :item="item" :theme="theme" />
	</Notivue>
	<NuxtLoadingIndicator :height="2" color="#3754db" />
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>
