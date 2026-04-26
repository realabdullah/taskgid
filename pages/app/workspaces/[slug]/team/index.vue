<script lang="ts" setup>
definePageMeta({ name: "workspaces-slug-team", layout: "workspace" });

const { workspace } = storeToRefs(useWorkspaceStore());
</script>

<template>
	<div class="space-y-6">
		<div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
			<div>
				<h1 class="text-text-primary text-xl font-semibold">Team</h1>
				<p class="text-text-secondary text-sm">Manage members, assignments, and performance.</p>
			</div>

			<div class="flex items-center gap-2">
				<AppWorkspaceInvite v-if="workspace" :workspace="workspace" render-trigger />
			</div>
		</div>

		<AppTeamMembersStats />
		<AppTeamMembersList />
	</div>
</template>
