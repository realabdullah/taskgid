<script lang="ts" setup>
import { TagManager } from "~/features/tags";
import WorkspaceInviteDialog from "~/features/workspaces/components/WorkspaceInviteDialog.vue";
import { useWorkspaceSettings } from "~/features/workspaces/composables/useWorkspaceSettings";

const { draft, hasChanges, isInviteOpen, isSaving, resetWorkspace, route, saveWorkspace, workspace } = useWorkspaceSettings();

// Renaming and deleting tags is admin-only server-side; the UI reflects that
// rather than letting the request fail.
const canManageTags = computed(() => ["admin", "owner"].includes(String(workspace.value?.userRole ?? "").toLowerCase()));
</script>

<template>
	<div class="product-page">
		<header class="product-header">
			<div>
				<p class="product-eyebrow">Workspace / Settings</p>
				<h1 class="product-title">Make this space yours.</h1>
				<p class="product-description">Update the workspace identity and control who can collaborate here.</p>
			</div>
			<Button v-if="workspace" variant="secondary" @click="isInviteOpen = true"><Icon name="lucide:user-plus" :size="16" /> Invite people</Button>
		</header>

		<div class="grid gap-10 lg:grid-cols-[260px_minmax(0,680px)]">
			<div>
				<h2 class="text-lg font-semibold">Workspace profile</h2>
				<p class="text-text-secondary mt-1 text-sm leading-6">The name, description, and address people see throughout Taskgid.</p>
			</div>
			<form class="product-panel space-y-5 p-5 sm:p-7" @submit.prevent="saveWorkspace">
				<div class="space-y-2"><label for="workspace-title" class="product-label">Workspace name</label><Input id="workspace-title" v-model="draft.title" placeholder="Acme product" /></div>
				<div class="space-y-2">
					<label for="workspace-description" class="product-label">Description</label
					><Textarea id="workspace-description" v-model="draft.description" class="min-h-28" placeholder="What does your team use this workspace for?" />
				</div>
				<div class="space-y-2">
					<label for="workspace-slug" class="product-label">Workspace address</label>
					<div class="border-border bg-surface-1 focus-within:border-focus flex items-center rounded-sm border">
						<span class="text-text-tertiary border-border border-e px-3 text-sm">taskgid.com/app/workspaces/</span
						><input id="workspace-slug" v-model="draft.slug" class="text-md min-w-0 flex-1 bg-transparent px-3 py-2 outline-none sm:text-sm" />
					</div>
					<p class="text-text-tertiary text-xs">Changing this also changes links to tasks in this workspace.</p>
				</div>
				<div class="border-border flex justify-end gap-2 border-t pt-5">
					<Button type="button" variant="ghost" :disabled="!hasChanges || isSaving" @click="resetWorkspace">Discard changes</Button
					><Button type="submit" :disabled="!hasChanges || !draft.title.trim() || !draft.slug.trim() || isSaving" :loading="isSaving">Save workspace</Button>
				</div>
			</form>

			<div>
				<h2 class="text-lg font-semibold">Members and access</h2>
				<p class="text-text-secondary mt-1 text-sm leading-6">Bring teammates into this workspace and manage the team from one place.</p>
			</div>
			<section class="product-panel divide-border divide-y">
				<div class="flex items-center justify-between gap-4 p-5">
					<div>
						<p class="text-sm font-medium">Workspace members</p>
						<p class="text-text-tertiary mt-1 text-xs tabular-nums">{{ workspace?.memberCount ?? 0 }} {{ workspace?.memberCount === 1 ? "member has" : "members have" }} access.</p>
					</div>
					<Button variant="secondary" @click="navigateTo(`/app/workspaces/${route.params.slug}/team`)">View people</Button>
				</div>
				<div class="flex items-center justify-between gap-4 p-5">
					<div>
						<p class="text-sm font-medium">Invite by email</p>
						<p class="text-text-tertiary mt-1 text-xs">Choose a role when you send the invitation.</p>
					</div>
					<Button @click="isInviteOpen = true">Invite people</Button>
				</div>
			</section>

			<div>
				<h2 class="text-lg font-semibold">Tags</h2>
				<p class="text-text-secondary mt-1 text-sm leading-6">Labels that cut across statuses, so related work can be found together.</p>
			</div>
			<section class="product-panel p-5 sm:p-7">
				<TagManager :workspace-slug="String(route.params.slug ?? '')" :can-manage="canManageTags" />
			</section>

			<div>
				<h2 class="text-lg font-semibold">Personal settings</h2>
				<p class="text-text-secondary mt-1 text-sm leading-6">Your profile, password, passkeys, and preferences are managed separately.</p>
			</div>
			<section class="product-panel flex items-center justify-between gap-4 p-5">
				<div>
					<p class="text-sm font-medium">Account settings</p>
					<p class="text-text-tertiary mt-1 text-xs">These changes follow you across every workspace.</p>
				</div>
				<Button variant="secondary" @click="navigateTo('/app/settings')">Open account</Button>
			</section>
		</div>

		<WorkspaceInviteDialog v-if="workspace" v-model="isInviteOpen" :workspace="workspace" />
	</div>
</template>
