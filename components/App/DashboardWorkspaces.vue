<script setup lang="ts">
import type { Workspace } from "~/types";
import { useWorkspacesStore } from "../../stores/workspaces";

const { workspaces } = storeToRefs(useWorkspacesStore());

const workspaceAccent = (slug: string) => {
	const palette = ["border-indigo-500", "border-violet-500", "border-teal-500", "border-amber-500", "border-rose-500", "border-sky-500"];
	const hash = Array.from(slug).reduce((acc, char) => acc + char.charCodeAt(0), 0);
	return palette[hash % palette.length];
};

const openWorkspace = async (workspace: Workspace) => {
	await navigateTo(`/app/workspaces/${workspace.slug}/tasks`);
};

const openCreateWorkspace = () => {
	window.dispatchEvent(new CustomEvent("taskgid:add-workspace-intent"));
};
</script>

<template>
	<section class="space-y-4">
		<div class="flex items-center justify-between">
			<h2 class="linear-title text-lg font-semibold">Workspaces</h2>
			<Button variant="secondary" size="sm" class="h-8" @click="openCreateWorkspace">
				<Icon name="lucide:plus" :size="14" />
				New workspace
			</Button>
		</div>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
			<article
				v-for="workspace in workspaces"
				:key="workspace.id"
				class="interactive linear-shell cursor-pointer rounded-lg border border-t-2 p-5 hover:-translate-y-0.5"
				:class="workspaceAccent(workspace.slug)"
				@click="openWorkspace(workspace)"
			>
				<div class="flex items-start justify-between gap-3">
					<div>
						<p class="text-text-primary text-base font-semibold">{{ workspace.title }}</p>
						<p class="text-text-tertiary mt-1 line-clamp-2 text-xs">{{ workspace.description || "No description yet." }}</p>
					</div>
					<Avatar class="h-8 w-8">
						<AvatarImage :src="workspace.user.profilePicture || ''" :alt="workspace.user.username" />
						<AvatarFallback class="bg-accent-soft text-accent-text">{{ getInitials(workspace.user.firstName, workspace.user.lastName) }}</AvatarFallback>
					</Avatar>
				</div>

				<div class="text-text-tertiary mt-5 flex items-center justify-between text-xs">
					<p>{{ workspace.memberCount }} member{{ workspace.memberCount > 1 ? "s" : "" }}</p>
					<p class="capitalize">{{ workspace.userRole }}</p>
					<p>{{ formatDate(workspace.updatedAt, "MMM D") }}</p>
				</div>
			</article>

			<button
				type="button"
				class="interactive border-border bg-surface-0 text-text-tertiary hover:bg-surface-2 flex min-h-[172px] flex-col items-center justify-center rounded-lg border border-dashed"
				@click="openCreateWorkspace"
			>
				<Icon name="lucide:plus" :size="20" />
				<span class="mt-2 text-sm font-medium">Create workspace</span>
			</button>
		</div>

	</section>
</template>
