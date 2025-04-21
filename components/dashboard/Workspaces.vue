<script lang="ts" setup>
import type { Workspace } from "~/types";

const props = defineProps<{
	workspaces?: Workspace[];
	invitedWorkspaces?: Workspace[];
	createdWorkspaces?: Workspace[];
}>();

const tabs = [
	{ value: "all", label: "All Workspaces" },
	{ value: "owned", label: "My Workspaces" },
	{ value: "invited", label: "Shared With Me" },
];

const data = computed<{ [key: string]: Workspace[] }>(() => ({
	all: props?.workspaces || [],
	owned: props?.createdWorkspaces || [],
	invited: props?.invitedWorkspaces || [],
}));
</script>

<template>
	<Tabs default-value="all" class="mb-6">
		<TabsList class="mb-4">
			<TabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value">{{ tab.label }}</TabsTrigger>
		</TabsList>

		<TabsContent v-for="tab in tabs" :key="tab.value" :value="tab.value">
			<div v-if="data[tab.value] && data[tab.value].length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<DashboardWorkspaceCard v-for="workspace in data[tab.value]" :key="workspace.id" :workspace="workspace" />
			</div>

			<DashboardWorkspaceEmptyState v-else />
		</TabsContent>
	</Tabs>
</template>
