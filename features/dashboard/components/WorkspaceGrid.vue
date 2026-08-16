<script setup lang="ts">
import { storeToRefs } from "pinia";

import { useWorkspacesStore } from "~/features/workspaces/stores";
import type { Workspace } from "~/types";
import { formatDate, getInitials } from "~/utils";

const { workspaces } = storeToRefs(useWorkspacesStore());
const openWorkspace = (workspace: Workspace) => navigateTo(`/app/workspaces/${workspace.slug}`);
const createWorkspace = () => window.dispatchEvent(new CustomEvent("taskgid:add-workspace-intent"));
</script>

<template>
	<section>
		<div class="mb-4 flex items-end justify-between gap-4">
			<div>
				<h2 class="text-text-primary text-lg font-semibold tracking-[-0.02em]">Workspaces</h2>
				<p class="text-text-tertiary mt-1 text-xs">Teams and projects you can access.</p>
			</div>
			<Button variant="ghost" size="sm" @click="createWorkspace"><Icon name="lucide:plus" :size="14" />New</Button>
		</div>

		<div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
			<Pressable
				v-for="workspace in workspaces"
				:key="workspace.id"
				class="border-border bg-surface-0 hover:border-border-strong group min-h-40 rounded-xl border p-5 text-start shadow-xs transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:shadow-sm"
				@click="openWorkspace(workspace)"
			>
				<span class="flex items-start justify-between gap-4">
					<span class="bg-accent-subtle text-accent-text flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold">{{ workspace.title.slice(0, 1).toUpperCase() }}</span>
					<Icon name="lucide:arrow-up-right" :size="16" class="text-text-tertiary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
				</span>
				<span class="text-text-primary mt-5 block text-sm font-semibold">{{ workspace.title }}</span>
				<span class="text-text-tertiary mt-1 line-clamp-1 block text-xs">{{ workspace.description || "A shared place for team work." }}</span>
				<span class="mt-4 flex items-center justify-between gap-3">
					<span class="flex items-center gap-2">
						<Avatar class="h-5 w-5"
							><AvatarImage :src="workspace.user.profilePicture || ''" /><AvatarFallback class="text-[9px]">{{
								getInitials(workspace.user.firstName, workspace.user.lastName)
							}}</AvatarFallback></Avatar
						>
						<span class="text-text-tertiary text-xs tabular-nums">{{ workspace.memberCount }} member{{ workspace.memberCount === 1 ? "" : "s" }}</span>
					</span>
					<span class="text-text-tertiary text-xs tabular-nums">{{ formatDate(workspace.updatedAt, "MMM D") }}</span>
				</span>
			</Pressable>

			<Pressable
				class="border-border text-text-tertiary hover:border-primary hover:bg-accent-soft flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed p-5 text-sm font-medium"
				@click="createWorkspace"
			>
				<span class="border-border bg-surface-0 flex h-9 w-9 items-center justify-center rounded-full border"><Icon name="lucide:plus" :size="17" /></span>
				<span class="mt-3">Create workspace</span>
			</Pressable>
		</div>
	</section>
</template>
