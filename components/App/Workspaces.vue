<script lang="ts" setup>
import { vAutoAnimate } from "@formkit/auto-animate/vue";
import type { Workspace } from "~/types";

const { isLoadingWorkspaces, workspaceType, workspaces, pagination } = storeToRefs(useWorkspacesStore());

const tabs = [
	{ value: "all", label: "All Workspaces" },
	{ value: "created", label: "My Workspaces" },
	{ value: "invited", label: "Shared With Me" },
];

const isViewWorkspaceModalOpen = ref(false);
const isWorkspaceInviteModalOpen = ref(false);
const isDeleteWorkspaceModalOpen = ref(false);
const isUpdateWorkspaceModalOpen = ref(false);
const selectedWorkspace = ref<Workspace | null>(null);

const setSelectedWorkspace = (usage: "view" | "update" | "invite", workspace: Workspace | null) => {
	selectedWorkspace.value = workspace;
	if (usage === "view") {
		isViewWorkspaceModalOpen.value = true;
		isUpdateWorkspaceModalOpen.value = false;
		isWorkspaceInviteModalOpen.value = false;
	} else if (usage === "invite") {
		isWorkspaceInviteModalOpen.value = true;
		isViewWorkspaceModalOpen.value = false;
		isUpdateWorkspaceModalOpen.value = false;
	} else if (usage === "update") {
		isUpdateWorkspaceModalOpen.value = true;
		isViewWorkspaceModalOpen.value = false;
		isWorkspaceInviteModalOpen.value = false;
	}
};

const workspaceDeleteAction = (payload: Workspace | boolean | string) => {
	if (typeof payload === "boolean") {
		isDeleteWorkspaceModalOpen.value = payload;
		if (!payload) selectedWorkspace.value = null;
		return;
	} else if (typeof payload === "string") {
		const index = workspaces.value?.findIndex((w) => w.slug === payload) || -1;
		if (index !== -1) workspaces.value?.splice(index, 1);
		selectedWorkspace.value = null;
		isDeleteWorkspaceModalOpen.value = false;
	} else {
		selectedWorkspace.value = payload;
		isDeleteWorkspaceModalOpen.value = true;
	}
};

const updateWorkspaces = (workspace: Workspace) => {
	const index = workspaces.value?.findIndex((w) => w.id === workspace.id) || -1;
	if (index !== -1 && workspaces.value) {
		const existing = workspaces.value[index];
		existing.title = workspace.title;
		existing.description = workspace.description;
		existing.slug = workspace.slug;
		existing.updatedAt = workspace.updatedAt;
	}
};

watch([isUpdateWorkspaceModalOpen, workspaceType], ([isUpdateWorkspaceModalOpen, type], [_, oldType]) => {
	if (!isUpdateWorkspaceModalOpen) selectedWorkspace.value = null;
	if (type !== oldType) pagination.value = { page: 1, limit: 10 };
});
</script>

<template>
	<Tabs v-model="workspaceType" class="mb-6">
		<TabsList class="mb-4">
			<TabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value">{{ tab.label }}</TabsTrigger>
		</TabsList>

		<TabsContent :value="workspaceType">
			<SkeletonWorkspace v-if="isLoadingWorkspaces" />

			<div v-else-if="workspaces && workspaces.length" v-auto-animate class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<AppWorkspaceCard
					v-for="workspace in workspaces"
					:key="workspace.id"
					:workspace="workspace"
					@view-workspace="setSelectedWorkspace('view', workspace)"
					@invite="setSelectedWorkspace('invite', workspace)"
					@update-workspace="setSelectedWorkspace('update', workspace)"
					@delete-workspace="workspaceDeleteAction(workspace)"
				/>
			</div>

			<AppWorkspaceEmptyState v-else />
		</TabsContent>

		<AppWorkspaceDetails v-if="selectedWorkspace" v-model="isViewWorkspaceModalOpen" :workspace="selectedWorkspace" @edit="setSelectedWorkspace('update', $event)" />
		<AppWorkspaceCreateOrEdit v-if="selectedWorkspace" v-model="isUpdateWorkspaceModalOpen" :workspace="selectedWorkspace" @update="updateWorkspaces" />
		<AppWorkspaceDelete v-model="isDeleteWorkspaceModalOpen" :slug="selectedWorkspace?.slug" @delete-action="workspaceDeleteAction" />
		<AppWorkspaceInvite v-if="selectedWorkspace" v-model="isWorkspaceInviteModalOpen" :workspace="selectedWorkspace" />
	</Tabs>
</template>
