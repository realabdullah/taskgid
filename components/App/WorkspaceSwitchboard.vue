<script setup lang="ts">
import { useWorkspacesStore } from "~/stores/workspaces";

const route = useRoute();
const { workspaces } = storeToRefs(useWorkspacesStore());
const isOpen = useState<boolean>("workspace-switchboard-open", () => false);
const search = ref("");

const currentWorkspace = computed(() => workspaces.value?.find((workspace) => workspace.slug === route.params.slug));
const visibleWorkspaces = computed(() => {
	const query = search.value.trim().toLowerCase();
	if (!query) return workspaces.value ?? [];
	return (workspaces.value ?? []).filter((workspace) => `${workspace.title} ${workspace.description ?? ""}`.toLowerCase().includes(query));
});

const openWorkspace = async (slug: string) => {
	isOpen.value = false;
	await navigateTo(`/app/workspaces/${slug}/tasks`);
};

const createWorkspace = () => {
	isOpen.value = false;
	window.dispatchEvent(new CustomEvent("taskgid:add-workspace-intent"));
};
</script>

<template>
	<Dialog v-model:open="isOpen">
		<DialogContent class="border-border bg-surface-0 w-[calc(100vw-1.5rem)] max-w-xl overflow-hidden rounded-md border p-0 shadow-lg sm:w-[calc(100vw-3rem)]">
			<DialogHeader class="sr-only">
				<DialogTitle>Switch workspace</DialogTitle>
				<DialogDescription>Search and open a workspace.</DialogDescription>
			</DialogHeader>

			<div class="border-border relative border-b">
				<Icon name="lucide:search" :size="17" class="text-text-tertiary pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" />
				<Input v-model="search" class="switchboard-search h-14 border-0 pl-10 text-base" placeholder="Search workspaces..." autofocus />
			</div>

			<div class="max-h-[min(60vh,420px)] overflow-y-auto p-2">
				<button
					v-for="workspace in visibleWorkspaces"
					:key="workspace.id"
					type="button"
					class="interactive focus-ring group relative flex w-full items-center gap-3 rounded-sm px-3 py-3 text-left"
					:class="workspace.slug === currentWorkspace?.slug ? 'bg-accent-soft text-accent-strong' : 'hover:bg-surface-2'"
					@click="openWorkspace(workspace.slug)"
				>
					<div class="bg-surface-2 text-text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-sm text-sm font-extrabold">
						{{ workspace.title.slice(0, 1).toUpperCase() }}
					</div>
					<span class="min-w-0 flex-1"
						><span class="text-text-primary block truncate text-sm font-bold">{{ workspace.title }}</span
						><span class="text-text-tertiary mt-0.5 block truncate text-xs">{{ workspace.description || "No description" }}</span></span
					>
					<Icon v-if="workspace.slug === currentWorkspace?.slug" name="lucide:check" :size="16" class="text-primary shrink-0" />
					<Icon v-else name="lucide:arrow-up-right" :size="15" class="text-text-tertiary shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
				</button>
			</div>

			<div class="border-border flex items-center justify-between border-t px-4 py-3">
				<p class="text-text-tertiary text-xs">{{ visibleWorkspaces.length }} available workspace{{ visibleWorkspaces.length === 1 ? "" : "s" }}</p>
				<Button size="sm" @click="createWorkspace"><Icon name="lucide:plus" :size="15" /> New workspace</Button>
			</div>
		</DialogContent>
	</Dialog>
</template>

<style scoped>
:deep(.switchboard-search:focus),
:deep(.switchboard-search:focus-visible) {
	border-color: transparent !important;
	box-shadow: none !important;
	outline: none !important;
}
</style>
