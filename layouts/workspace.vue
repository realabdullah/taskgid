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
	<SidebarProvider class="bg-surface-1">
		<AppSidebar />

		<SidebarInset class="bg-surface-1 relative">
			<div class="from-brand-hero-start pointer-events-none absolute inset-x-0 top-0 h-44 bg-linear-to-b to-transparent" />
			<AppHeader />
			<div class="bg-surface-1 relative z-10 flex-1 overflow-auto">
				<div class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
					<slot />
				</div>
			</div>

			<UserSettingsSheet />
			<AppWorkspaceCreateOrEdit v-model="isCreateWorkspaceOpen" is-creating hide-trigger />
		</SidebarInset>
	</SidebarProvider>
</template>
