<script lang="ts" setup>
definePageMeta({ name: "workspaces-slug-team", layout: "workspace" });

const { workspace } = storeToRefs(useWorkspaceStore());
</script>

<template>
	<div class="space-y-6">
		<div class="flex flex-col justify-between gap-4 sm:flex-row">
			<div>
				<h1 class="text-3xl font-bold tracking-tight">Team Members</h1>
				<p class="text-muted-foreground">Manage team members and their permissions</p>
			</div>

			<AppWorkspaceInvite v-if="workspace" :workspace="workspace" render-trigger />
		</div>

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<div class="lg:col-span-2">
				<AppTeamMembersList />
			</div>
			<div>
				<AppTeamMembersStats />
			</div>
		</div>
	</div>
</template>
