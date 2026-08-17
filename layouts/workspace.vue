<script lang="ts" setup>
import { MobileDock, ProductHeader, ShortcutSheet } from "~/features/navigation";
import { WorkspaceEditorDialog, WorkspaceSwitchboard } from "~/features/workspaces";

const isCreateWorkspaceOpen = useState<boolean>("create-workspace-open", () => false);

const openCreateWorkspace = () => {
	isCreateWorkspaceOpen.value = true;
};

onMounted(() => {
	window.addEventListener("taskgid:add-workspace-intent", openCreateWorkspace);
});

onBeforeUnmount(() => {
	window.removeEventListener("taskgid:add-workspace-intent", openCreateWorkspace);
});
</script>

<template>
	<div class="bg-canvas min-h-svh">
		<ProductHeader />
		<main id="main-content" class="relative z-10 mx-auto w-full max-w-[1540px] px-4 py-6 pb-24 sm:px-6 lg:px-10 lg:py-8"><slot /></main>
		<WorkspaceSwitchboard />
		<MobileDock />
		<WorkspaceEditorDialog v-model="isCreateWorkspaceOpen" is-creating hide-trigger />
		<ShortcutSheet />
	</div>
</template>
