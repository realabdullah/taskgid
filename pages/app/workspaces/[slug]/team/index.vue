<script lang="ts" setup>
definePageMeta({ name: "workspaces-slug-team", layout: "workspace" });

const { workspace } = storeToRefs(useWorkspaceStore());
</script>

<template>
	<div class="space-y-10">
		<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
			<div>
				<p class="text-signal text-sm font-bold">Team</p>
				<h1 class="page-heading mt-2">Team members</h1>
				<p class="page-intro mt-3">Review team member capacity, task ownership, and where support is needed.</p>
			</div>

			<div class="flex items-center gap-2">
				<AppWorkspaceInvite v-if="workspace" :workspace="workspace" render-trigger />
			</div>
		</div>

		<AppTeamMembersStats />
		<AppTeamMembersList />
	</div>
</template>
