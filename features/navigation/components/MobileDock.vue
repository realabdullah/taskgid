<script setup lang="ts">
import { useWorkspacesStore } from "~/features/workspaces/stores";

const route = useRoute();
const { workspaces } = storeToRefs(useWorkspacesStore());
const workspaceSlug = computed(() => (typeof route.params.slug === "string" ? route.params.slug : workspaces.value?.[0]?.slug));
const workspaceRoot = computed(() => (workspaceSlug.value ? `/app/workspaces/${workspaceSlug.value}` : "/app"));
const isWorkspaceActive = computed(() => route.name === "workspaces-slug" || route.name === "workspaces-slug-settings");
const isTasksActive = computed(() => route.name === "tasks" || route.name === "task-id");

const createTask = () => window.dispatchEvent(new CustomEvent("taskgid:new-task-intent"));
const openAccountSettings = () => navigateTo("/app/settings");
</script>

<template>
	<nav
		class="border-border bg-canvas/95 fixed inset-x-0 bottom-0 z-30 flex h-[calc(4.5rem+env(safe-area-inset-bottom))] items-start justify-around border-t px-3 pt-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden"
		aria-label="Primary navigation"
	>
		<NuxtLink
			to="/app"
			class="focus-ring interactive flex min-w-14 flex-col items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold active:scale-[0.96]"
			:class="route.name === 'app' ? 'text-primary' : 'text-text-tertiary'"
			:aria-current="route.name === 'app' ? 'page' : undefined"
		>
			<Icon name="lucide:house" :size="19" /> My work
		</NuxtLink>
		<NuxtLink
			:to="workspaceSlug ? `/app/workspaces/${workspaceSlug}/tasks` : '/app'"
			class="focus-ring interactive flex min-w-14 flex-col items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold active:scale-[0.96]"
			:class="isTasksActive ? 'text-primary' : 'text-text-tertiary'"
			:aria-current="isTasksActive ? 'page' : undefined"
		>
			<Icon name="lucide:list-checks" :size="19" /> Tasks
		</NuxtLink>
		<Button type="button" size="icon" class="-mt-5 h-12 w-12 rounded-md shadow-md" aria-label="Create task" @click="createTask">
			<Icon name="lucide:plus" :size="22" />
		</Button>
		<NuxtLink
			:to="workspaceRoot"
			class="focus-ring interactive flex min-w-14 flex-col items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold active:scale-[0.96]"
			:class="isWorkspaceActive ? 'text-primary' : 'text-text-tertiary'"
			:aria-current="isWorkspaceActive ? 'page' : undefined"
		>
			<Icon name="lucide:panels-top-left" :size="19" /> Workspace
		</NuxtLink>
		<Button type="button" variant="ghost" static class="text-text-tertiary h-auto min-w-14 rounded-lg px-2 py-1 text-xs" content-class="flex-col gap-1" @click="openAccountSettings">
			<Icon name="lucide:user-round" :size="19" /> Account
		</Button>
	</nav>
</template>
