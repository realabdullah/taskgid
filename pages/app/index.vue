<script lang="ts" setup>
definePageMeta({
	name: "app",
	title: "Dashboard",
	description: "TaskGid - Dashboard",
});

const { user } = storeToRefs(useStore());
const isUserProfileOpen = ref(false);
const isUserSettingsOpen = ref(false);

const setSettingsOpen = () => {
	isUserSettingsOpen.value = true;
	isUserProfileOpen.value = false;
};
</script>

<template>
	<div class="flex h-full flex-1 flex-col overflow-hidden">
		<AppHeader @view-profile="isUserProfileOpen = true" @edit-user="setSettingsOpen" />

		<main class="container mx-auto flex-1 overflow-auto p-6">
			<div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
				<div>
					<h1 class="text-2xl font-bold">Welcome back, {{ user?.firstName }}</h1>
					<p class="text-muted-foreground">Member since {{ formatDate(user?.createdAt) }}</p>
				</div>

				<AppWorkspaceCreateOrEdit is-creating />
			</div>

			<AppPendingInvites />
			<AppWorkspaces />

			<UserProfile v-model="isUserProfileOpen" @edit="setSettingsOpen" />
			<UserSettings v-model="isUserSettingsOpen" />
		</main>
	</div>
</template>
