<script lang="ts" setup>
import TeamMembersList from "~/features/teams/components/TeamMembersList.vue";
import TeamStats from "~/features/teams/components/TeamStats.vue";
import { WorkspaceInviteDialog } from "~/features/workspaces";
import { useWorkspaceStore } from "~/features/workspaces/stores";

const { workspace } = storeToRefs(useWorkspaceStore());
</script>

<template>
	<div class="product-page">
		<header class="product-header">
			<div>
				<p class="product-eyebrow">Workspace / People</p>
				<h1 class="product-title mt-2">The people behind the work.</h1>
				<p class="product-description">Review ownership, capacity, and where support is needed.</p>
			</div>

			<div class="flex items-center gap-2">
				<WorkspaceInviteDialog v-if="workspace" :workspace="workspace" render-trigger />
			</div>
		</header>

		<TeamStats />
		<TeamMembersList />
	</div>
</template>
