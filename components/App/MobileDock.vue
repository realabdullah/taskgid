<script setup lang="ts">
import { useWorkspacesStore } from "~/stores/workspaces";

const route = useRoute();
const { workspaces } = storeToRefs(useWorkspacesStore());
const switchboardOpen = useState<boolean>("workspace-switchboard-open", () => false);
const workspaceSlug = computed(() => (typeof route.params.slug === "string" ? route.params.slug : workspaces.value?.[0]?.slug));

const createTask = () => window.dispatchEvent(new CustomEvent("taskgid:new-task-intent"));
</script>

<template>
	<nav
		class="border-border bg-canvas/95 fixed inset-x-0 bottom-0 z-30 flex h-[calc(4.5rem+env(safe-area-inset-bottom))] items-start justify-around border-t px-3 pt-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden"
		aria-label="Primary navigation"
	>
		<NuxtLink to="/app" class="flex min-w-14 flex-col items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold" :class="route.name === 'app' ? 'text-primary' : 'text-text-tertiary'">
			<Icon name="lucide:house" :size="19" /> Home
		</NuxtLink>
		<NuxtLink
			:to="workspaceSlug ? `/app/workspaces/${workspaceSlug}/tasks` : '/app'"
			class="flex min-w-14 flex-col items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold"
			:class="route.name === 'tasks' ? 'text-primary' : 'text-text-tertiary'"
		>
			<Icon name="lucide:list-checks" :size="19" /> Tasks
		</NuxtLink>
		<button type="button" class="bg-primary text-primary-foreground -mt-5 flex h-12 w-12 items-center justify-center rounded-md shadow-md" aria-label="Create task" @click="createTask">
			<Icon name="lucide:plus" :size="22" />
		</button>
		<button type="button" class="text-text-tertiary flex min-w-14 flex-col items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold" @click="switchboardOpen = true">
			<Icon name="lucide:panels-top-left" :size="19" /> Spaces
		</button>
		<button
			type="button"
			class="text-text-tertiary flex min-w-14 flex-col items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold"
			@click="window.dispatchEvent(new CustomEvent('taskgid:open-settings-intent'))"
		>
			<Icon name="lucide:user-round" :size="19" /> Account
		</button>
	</nav>
</template>
