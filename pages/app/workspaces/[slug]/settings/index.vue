<script lang="ts" setup>
definePageMeta({ name: "workspaces-slug-settings", layout: "workspace" });

const { workspace } = storeToRefs(useWorkspaceStore());
const isWorkspaceEditorOpen = ref(false);
const isInviteOpen = ref(false);

const openUserSettings = () => {
	window.dispatchEvent(new CustomEvent("taskgid:open-settings-intent"));
};
</script>

<template>
	<div class="space-y-8">
		<div class="max-w-2xl">
			<p class="editorial-kicker">Workspace settings</p>
			<h1 class="page-heading mt-2">Shape how your team works.</h1>
			<p class="page-intro mt-3">Keep workspace identity, access, and your account preferences in one deliberate place.</p>
		</div>

		<section v-if="workspace" class="border-border bg-surface-0 rounded-2xl border p-5 sm:p-6">
			<div class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
				<div class="min-w-0">
					<p class="editorial-kicker">Workspace profile</p>
					<h2 class="mt-1 text-2xl font-bold tracking-[-0.03em]">{{ workspace.title }}</h2>
					<p class="text-text-secondary mt-2 max-w-xl text-sm leading-6">{{ workspace.description || "Add a short description so teammates know what this space is for." }}</p>
				</div>
				<Button variant="secondary" class="w-full shrink-0 sm:w-auto" @click="isWorkspaceEditorOpen = true"> <Icon name="lucide:pencil" :size="15" /> Edit workspace </Button>
			</div>

			<dl class="border-border mt-6 grid gap-4 border-t pt-5 text-sm sm:grid-cols-3">
				<div>
					<dt class="text-text-tertiary text-xs font-semibold">Workspace URL</dt>
					<dd class="text-text-primary mt-1 font-mono text-xs">/ {{ workspace.slug }}</dd>
				</div>
				<div>
					<dt class="text-text-tertiary text-xs font-semibold">Your role</dt>
					<dd class="text-text-primary mt-1 font-medium capitalize">{{ workspace.userRole }}</dd>
				</div>
				<div>
					<dt class="text-text-tertiary text-xs font-semibold">Members</dt>
					<dd class="text-text-primary mt-1 font-medium">{{ workspace.memberCount }} {{ workspace.memberCount === 1 ? "person" : "people" }}</dd>
				</div>
			</dl>
		</section>

		<section class="border-border grid overflow-hidden rounded-2xl border lg:grid-cols-2">
			<div class="bg-surface-0 p-5 sm:p-6">
				<p class="editorial-kicker">Team access</p>
				<h2 class="mt-1 text-xl font-bold tracking-[-0.02em]">Bring the right people in.</h2>
				<p class="text-text-secondary mt-2 text-sm leading-6">Invite teammates to collaborate in this workspace. Their role is chosen when you send the invitation.</p>
				<Button v-if="workspace" class="mt-5" @click="isInviteOpen = true"><Icon name="lucide:user-plus" :size="16" /> Invite teammate</Button>
			</div>
			<div class="border-border bg-surface-1 border-t p-5 sm:p-6 lg:border-t-0 lg:border-l">
				<p class="editorial-kicker">Account</p>
				<h2 class="mt-1 text-xl font-bold tracking-[-0.02em]">Personal preferences.</h2>
				<p class="text-text-secondary mt-2 text-sm leading-6">Update your profile, appearance, notifications, and security settings without leaving your workspace.</p>
				<Button variant="secondary" class="mt-5" @click="openUserSettings"><Icon name="lucide:sliders-horizontal" :size="16" /> Open account settings</Button>
			</div>
		</section>

		<AppWorkspaceCreateOrEdit v-if="workspace" v-model="isWorkspaceEditorOpen" :workspace="workspace" hide-trigger />
		<AppWorkspaceInvite v-if="workspace" v-model="isInviteOpen" :workspace="workspace" />
	</div>
</template>
