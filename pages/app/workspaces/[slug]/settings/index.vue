<script lang="ts" setup>
definePageMeta({ name: "workspaces-slug-settings", layout: "workspace" });

const openUserSettings = () => {
	window.dispatchEvent(new CustomEvent("taskgid:open-settings-intent"));
};
</script>

<template>
	<div class="space-y-6">
		<div>
			<h1 class="text-text-primary text-xl font-semibold">Workspace Settings</h1>
			<p class="text-text-secondary text-sm">Workspace-level settings are being prepared. You can still manage your account settings right now.</p>
		</div>

		<AppEmptyState
			heading="Workspace settings are coming soon"
			body="Manage your profile, security, and account preferences from the settings sheet while workspace controls are finalized."
			icon="lucide:settings-2"
			:action="{ label: 'Open account settings', onClick: openUserSettings, variant: 'secondary' }"
		/>
	</div>
</template>
