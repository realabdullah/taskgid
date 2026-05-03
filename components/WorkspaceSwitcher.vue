<script setup lang="ts">
import { useSidebar } from "@/components/ui/sidebar";

const route = useRoute();
const { workspaces } = storeToRefs(useWorkspacesStore());
const { isMobile } = useSidebar();

const swatchPool = ["#4f46e5", "#7c3aed", "#0f766e", "#b45309", "#e11d48", "#0284c7"];

const getWorkspaceSwatch = (seed: string) => {
	let hash = 0;
	for (let index = 0; index < seed.length; index += 1) {
		hash = (hash << 5) - hash + seed.charCodeAt(index);
		hash |= 0;
	}
	return swatchPool[Math.abs(hash) % swatchPool.length];
};

const activeWorkspace = computed(() => {
	return workspaces.value?.find((workspace) => workspace.slug === route.params.slug);
});

const switchWorkspace = (slug: string) => {
	if (slug !== activeWorkspace.value?.slug) {
		navigateTo(`/app/workspaces/${slug}/tasks`);
	}
};

const openAddWorkspace = () => {
	globalThis.window.dispatchEvent(new globalThis.CustomEvent("taskgid:add-workspace-intent"));
};
</script>

<template>
	<SidebarMenu>
		<SidebarMenuItem>
			<DropdownMenu>
				<DropdownMenuTrigger as-child>
					<SidebarMenuButton size="lg" class="linear-shell hover:bg-surface-2 data-[state=open]:bg-surface-2 h-10 gap-2 rounded-md px-2">
						<div
							class="text-accent-strong flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm font-semibold"
							:style="{ backgroundColor: `${getWorkspaceSwatch(activeWorkspace?.slug || 'default')}22`, color: getWorkspaceSwatch(activeWorkspace?.slug || 'default') }"
						>
							{{ (activeWorkspace?.title || "WS").slice(0, 2).toUpperCase() }}
						</div>
						<div class="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
							<span class="text-text-primary truncate text-sm font-medium">{{ activeWorkspace?.title || "Select workspace" }}</span>
							<span class="text-2xs text-text-tertiary truncate">{{ activeWorkspace?.slug }}</span>
						</div>
						<Icon name="lucide:chevrons-up-down" :size="14" class="text-text-tertiary group-data-[collapsible=icon]:hidden" />
					</SidebarMenuButton>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					class="border-border bg-surface-0 w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg border p-1"
					align="start"
					:side="isMobile ? 'bottom' : 'right'"
					:side-offset="4"
				>
					<DropdownMenuLabel class="text-2xs text-text-tertiary px-2 py-1 font-semibold tracking-widest uppercase">Workspaces</DropdownMenuLabel>
					<DropdownMenuItem
						v-for="workspace in workspaces"
						:key="workspace.title"
						class="text-text-secondary hover:bg-surface-2 hover:text-text-primary h-8 gap-2 rounded-md px-2 text-sm"
						@select="switchWorkspace(workspace.slug)"
					>
						<div
							class="text-2xs flex h-5 w-5 items-center justify-center rounded font-semibold"
							:style="{ backgroundColor: `${getWorkspaceSwatch(workspace.slug)}22`, color: getWorkspaceSwatch(workspace.slug) }"
						>
							{{ workspace.title.slice(0, 2).toUpperCase() }}
						</div>
						<span class="flex-1 truncate">{{ workspace.title }}</span>
						<Icon v-if="workspace.slug === activeWorkspace?.slug" name="lucide:check" :size="14" class="text-primary" />
					</DropdownMenuItem>
					<DropdownMenuSeparator class="border-border my-1" />
					<DropdownMenuItem class="text-primary hover:bg-accent-subtle h-8 gap-2 rounded-md px-2" @select="openAddWorkspace">
						<Icon name="lucide:plus" :size="14" />
						<div class="font-medium">Add workspace</div>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</SidebarMenuItem>
	</SidebarMenu>
</template>
