<script setup lang="ts">
import type { Workspace } from "~/types";
import { useWorkspacesStore } from "../../stores/workspaces";

const { workspaces } = storeToRefs(useWorkspacesStore());

const openWorkspace = async (workspace: Workspace) => {
	await navigateTo(`/app/workspaces/${workspace.slug}/tasks`);
};

const openCreateWorkspace = () => {
	window.dispatchEvent(new CustomEvent("taskgid:add-workspace-intent"));
};
</script>

<template>
	<section class="pb-8">
		<div class="flex items-center justify-between">
			<div>
				<p class="editorial-kicker">Your spaces</p>
				<h2 class="linear-title mt-1 text-2xl">Workspaces</h2>
				<p class="text-text-secondary mt-2 text-sm">Jump back into a team space.</p>
			</div>
			<Button variant="secondary" size="sm" class="h-8" @click="openCreateWorkspace">
				<Icon name="lucide:plus" :size="14" />
				New workspace
			</Button>
		</div>

		<div class="mt-6 grid gap-3 lg:grid-cols-2">
			<article
				v-for="workspace in workspaces"
				:key="workspace.id"
				class="interactive focus-ring border-border bg-surface-0 hover:border-accent/35 grid cursor-pointer gap-4 rounded-xl border p-5 hover:shadow-sm md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
				@click="openWorkspace(workspace)"
			>
				<div class="flex min-w-0 items-start gap-3">
					<div class="bg-accent-subtle text-accent-text flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-semibold">{{ workspace.title.slice(0, 1).toUpperCase() }}</div>
					<div>
						<p class="text-text-primary text-base font-semibold">{{ workspace.title }}</p>
						<p class="text-text-secondary mt-1 line-clamp-2 text-sm">{{ workspace.description || "No description yet." }}</p>
					</div>
					<Avatar class="h-8 w-8">
						<AvatarImage :src="workspace.user.profilePicture || ''" :alt="workspace.user.username" />
						<AvatarFallback class="bg-accent-soft text-accent-text">{{ getInitials(workspace.user.firstName, workspace.user.lastName) }}</AvatarFallback>
					</Avatar>
				</div>

				<div class="text-text-tertiary flex items-center gap-4 text-xs font-semibold">
					<p>{{ workspace.memberCount }} member{{ workspace.memberCount > 1 ? "s" : "" }}</p>
					<p class="capitalize">{{ workspace.userRole }}</p>
					<p>{{ formatDate(workspace.updatedAt, "MMM D") }}</p>
				</div>
			</article>

			<button
				type="button"
				class="interactive focus-ring border-border bg-surface-0 text-text-secondary hover:border-accent/35 hover:bg-accent-subtle/35 flex min-h-32 flex-row items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold"
				@click="openCreateWorkspace"
			>
				<Icon name="lucide:plus" :size="20" />
				<span>Create workspace</span>
			</button>
		</div>
	</section>
</template>
