<script setup lang="ts">
import { useWorkspacesStore } from "~/features/workspaces/stores/workspaces";

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

const workspaceSummary = computed(() => `${workspaces.value?.length ?? 0} workspace${workspaces.value?.length === 1 ? "" : "s"}`);

const openWorkspace = async (slug: string) => {
	isOpen.value = false;
	await navigateTo(`/app/workspaces/${slug}`);
};

const createWorkspace = () => {
	isOpen.value = false;
	window.dispatchEvent(new CustomEvent("taskgid:add-workspace-intent"));
};
</script>

<template>
	<Dialog v-model:open="isOpen">
		<DialogContent class="border-border bg-surface-0 w-[calc(100vw-1.5rem)] max-w-3xl overflow-hidden rounded-xl border p-0 shadow-lg sm:w-[calc(100vw-3rem)]">
			<DialogHeader class="sr-only">
				<DialogTitle>Switch workspace</DialogTitle>
				<DialogDescription>Search and open a workspace.</DialogDescription>
			</DialogHeader>

			<header class="border-border border-b px-5 pt-5 pb-4 sm:px-6">
				<div class="flex items-start justify-between gap-8 pe-8">
					<div>
						<p class="product-eyebrow">Switch workspace</p>
						<h2 class="text-text-primary mt-1 text-xl font-semibold tracking-[-0.02em]">Where do you want to work?</h2>
					</div>
					<p class="text-text-tertiary mt-1 text-xs">{{ workspaceSummary }}</p>
				</div>
				<div class="relative mt-4">
					<Icon name="lucide:search" :size="16" class="text-text-tertiary pointer-events-none absolute start-3 top-1/2 -translate-y-1/2" />
					<Input v-model="search" class="switchboard-search h-10 rounded-md ps-9" placeholder="Search by name or description" autofocus />
				</div>
			</header>

			<div class="grid max-h-[min(62vh,520px)] gap-2 overflow-y-auto p-3 sm:grid-cols-2 sm:p-4">
				<Pressable
					v-for="workspace in visibleWorkspaces"
					:key="workspace.id"
					class="border-border group relative flex min-h-28 w-full flex-col items-start justify-between rounded-lg border p-4 text-start"
					:class="workspace.slug === currentWorkspace?.slug ? 'border-focus bg-accent-soft' : 'bg-surface-0 hover:border-border-strong hover:bg-surface-1'"
					@click="openWorkspace(workspace.slug)"
				>
					<span class="flex w-full items-start justify-between gap-3">
						<span class="bg-surface-2 text-text-primary flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold">{{ workspace.title.slice(0, 1).toUpperCase() }}</span>
						<span class="relative h-[15px] w-[15px] shrink-0">
							<Icon
								name="lucide:check"
								:size="15"
								class="text-focus absolute inset-0 transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
								:class="workspace.slug === currentWorkspace?.slug ? 'blur-0 scale-100 opacity-100' : 'scale-[0.25] opacity-0 blur-[4px]'"
							/>
							<Icon
								name="lucide:arrow-up-right"
								:size="15"
								class="text-text-tertiary absolute inset-0 transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
								:class="
									workspace.slug === currentWorkspace?.slug
										? 'scale-[0.25] opacity-0 blur-[4px]'
										: 'group-hover:blur-0 scale-[0.25] opacity-0 blur-[4px] group-hover:scale-100 group-hover:opacity-100'
								"
							/>
						</span>
					</span>
					<span class="mt-3 min-w-0"
						><span class="text-text-primary block truncate text-sm font-semibold">{{ workspace.title }}</span
						><span class="text-text-tertiary mt-1 line-clamp-2 block text-xs leading-5">{{ workspace.description || "No description yet." }}</span></span
					>
					<span class="text-text-tertiary mt-3 text-xs tabular-nums">{{ workspace.memberCount }} member{{ workspace.memberCount === 1 ? "" : "s" }} · {{ workspace.userRole }}</span>
				</Pressable>
				<Pressable
					class="border-border text-text-tertiary hover:border-text-tertiary hover:text-text-primary flex min-h-28 flex-col items-center justify-center rounded-lg border border-dashed p-4 text-sm font-medium"
					@click="createWorkspace"
				>
					<Icon name="lucide:plus" :size="18" /><span class="mt-2">Create workspace</span>
				</Pressable>
			</div>

			<div class="border-border bg-surface-1 flex items-center justify-between border-t px-5 py-3">
				<p class="text-text-tertiary text-xs">Tip: press ⌘K to move between workspaces and tasks.</p>
				<Button size="sm" @click="createWorkspace"><Icon name="lucide:plus" :size="15" />New workspace</Button>
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
