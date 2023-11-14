<script lang="ts" setup>
import { lightTheme, type NotivueTheme, type NotivueItem } from "notivue";
import AcceptInviteNotification, { type AcceptInviteNotificationProps } from "@/components/AcceptInviteNotification.vue";

const theme: NotivueTheme = {
	...lightTheme,
	"--nv-spacing": "1rem",
	"--nv-icon-size": "2rem",
	"--nv-message-size": "1.6rem",
};
</script>

<template>
	<Notivue v-slot="item">
		<AcceptInviteNotification v-if="item.props.type === 'accept'" :item="item as NotivueItem<AcceptInviteNotificationProps>" :theme="theme" />
		<Notifications v-else :item="item" :theme="theme" />
	</Notivue>
	<NuxtLoadingIndicator :height="2" color="#3754db" />
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>
