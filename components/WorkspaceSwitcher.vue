<script setup lang="ts">
import { useSidebar } from "@/components/ui/sidebar";

const route = useRoute();
const { workspaces } = storeToRefs(useWorkspacesStore());
const { isMobile } = useSidebar();

const activeWorkspace = computed(() => {
	return workspaces.value?.find((workspace) => workspace.slug === route.params.slug);
});

const switchWorkspace = (slug: string) => {
	if (slug !== activeWorkspace.value?.slug) {
		navigateTo(`/app/workspaces/${slug}`);
	}
};
</script>

<template>
	<SidebarMenu>
		<SidebarMenuItem>
			<DropdownMenu>
				<DropdownMenuTrigger as-child>
					<SidebarMenuButton size="lg" class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
						<div class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
							<div class="bg-primary flex h-8 w-8 items-center justify-center rounded-md">
								<Icon name="hugeicons:checkmark-circle-03" :size="16" class="text-primary-foreground" />
							</div>
						</div>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-medium">
								{{ activeWorkspace?.title }}
							</span>
							<span class="truncate text-xs">{{ activeWorkspace?.slug }}</span>
						</div>
						<Icon name="hugeicons:square-arrow-data-transfer-vertical" :size="16" class="ml-auto" />
					</SidebarMenuButton>
				</DropdownMenuTrigger>
				<DropdownMenuContent class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg" align="start" :side="isMobile ? 'bottom' : 'right'" :side-offset="4">
					<DropdownMenuLabel class="text-muted-foreground text-xs"> Workspaces </DropdownMenuLabel>
					<DropdownMenuItem v-for="(workspace, index) in workspaces" :key="workspace.title" class="gap-2 p-2" @click="switchWorkspace(workspace.slug)">
						{{ workspace.title }}
						<DropdownMenuShortcut>⌘{{ index + 1 }}</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem class="gap-2 p-2">
						<div class="flex size-6 items-center justify-center rounded-md border bg-transparent">
							<Icon name="hugeicons:plus-sign-square" :size="16" />
						</div>
						<div class="text-muted-foreground font-medium">Add workspace</div>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</SidebarMenuItem>
	</SidebarMenu>
</template>
