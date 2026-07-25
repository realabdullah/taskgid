<script lang="ts" setup>
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
		<AppHeader />
		<main class="relative z-10 mx-auto w-full max-w-[1540px] px-5 py-7 pb-24 sm:px-8 lg:px-12 lg:py-10"><slot /></main>
		<AppWorkspaceSwitchboard />
		<AppMobileDock />
		<UserSettingsSheet />
		<AppWorkspaceCreateOrEdit v-model="isCreateWorkspaceOpen" is-creating hide-trigger />
	</div>
</template>
