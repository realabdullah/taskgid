<script lang="ts" setup>
import type { Workspace } from "~/types";

const props = defineProps<{
	invitedWorkspaces?: Workspace[];
	createdWorkspaces?: Workspace[];
}>();

const { workspaces } = storeToRefs(useWorkspaceStore());

const tabs = [
	{ value: "all", label: "All Workspaces" },
	{ value: "owned", label: "My Workspaces" },
	{ value: "invited", label: "Shared With Me" },
];

const isDeleteWorkspaceModalOpen = ref(false);
const isUpdateWorkspaceModalOpen = ref(false);
const selectedWorkspace = ref<Workspace | null>(null);

const setSelectedWorkspace = (workspace: Workspace | null) => {
	selectedWorkspace.value = workspace;
	isUpdateWorkspaceModalOpen.value = true;
};

const workspaceDeleteAction = (payload: Workspace | boolean | string) => {
	if (typeof payload === "boolean") {
		isDeleteWorkspaceModalOpen.value = payload;
		if (!payload) selectedWorkspace.value = null;
		return;
	} else if (typeof payload === "string") {
		const index = workspaces.value.findIndex((w) => w.slug === payload);
		if (index !== -1) workspaces.value.splice(index, 1);
		selectedWorkspace.value = null;
		isDeleteWorkspaceModalOpen.value = false;
	} else {
		selectedWorkspace.value = payload;
		isDeleteWorkspaceModalOpen.value = true;
	}
};

const updateWorkspaces = (workspace: Workspace) => {
	const index = workspaces.value.findIndex((w) => w.id === workspace.id);
	if (index !== -1) {
		const existing = workspaces.value[index];
		existing.title = workspace.title;
		existing.description = workspace.description;
		existing.slug = workspace.slug;
		existing.updatedAt = workspace.updatedAt;
	}
};

const data = computed<{ [key: string]: Workspace[] }>(() => ({
	all: workspaces.value,
	owned: props?.createdWorkspaces || [],
	invited: props?.invitedWorkspaces || [],
}));

watch(
	() => isUpdateWorkspaceModalOpen.value,
	(newValue) => {
		if (!newValue) {
			selectedWorkspace.value = null;
		}
	}
);
</script>

<template>
	<Tabs default-value="all" class="mb-6">
		<TabsList class="mb-4">
			<TabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value">{{ tab.label }}</TabsTrigger>
		</TabsList>

		<TabsContent v-for="tab in tabs" :key="tab.value" :value="tab.value">
			<div v-if="data[tab.value] && data[tab.value].length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<DashboardWorkspaceCard
					v-for="workspace in data[tab.value]"
					:key="workspace.id"
					:workspace="workspace"
					@update-workspace="setSelectedWorkspace"
					@delete-workspace="workspaceDeleteAction"
				/>
			</div>

			<DashboardWorkspaceEmptyState v-else />
		</TabsContent>

		<DashboardWorkspaceCreateOrEdit v-if="selectedWorkspace" v-model="isUpdateWorkspaceModalOpen" :workspace="selectedWorkspace" @update="updateWorkspaces" />
		<DashboardWorkspaceDelete :is-open="isDeleteWorkspaceModalOpen" :slug="selectedWorkspace?.slug" @delete-action="workspaceDeleteAction" />
	</Tabs>
</template>
