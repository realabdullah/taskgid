<script setup lang="ts">
import type { SidebarProps } from "@/components/ui/sidebar";

const { collapsible = "icon", ...props } = defineProps<SidebarProps>();

useWorkspaceStore();
const route = useRoute();
const { workspaces } = storeToRefs(useWorkspacesStore());

const currentSlug = computed(() => {
	const slug = route.params.slug;
	if (typeof slug === "string" && slug.length > 0) {
		return slug;
	}
	return workspaces.value?.[0]?.slug ?? "";
});

const workspaceNav = computed(() => [
	{
		title: "Tasks",
		url: currentSlug.value ? `/app/workspaces/${currentSlug.value}/tasks` : "/app",
		isActive: route.name === "tasks",
		icon: "lucide:list",
		shortcut: "G T",
		disabled: !currentSlug.value,
	},
	{
		title: "Team",
		url: currentSlug.value ? `/app/workspaces/${currentSlug.value}/team` : "/app",
		isActive: route.name === "workspaces-slug-team",
		icon: "lucide:users",
		shortcut: "G M",
		disabled: !currentSlug.value,
	},
	{
		title: "Settings",
		url: currentSlug.value ? `/app/workspaces/${currentSlug.value}/settings` : "/app",
		isActive: route.name === "workspaces-slug-settings",
		icon: "lucide:settings",
		shortcut: "G S",
		disabled: !currentSlug.value,
	},
]);

const myWorkNav = computed(() => [
	{ title: "My Tasks", url: "/app", isActive: route.name === "app", icon: "lucide:check-square" },
	{ title: "Recent", url: currentSlug.value ? `/app/workspaces/${currentSlug.value}` : "/app", isActive: route.name === "workspaces-slug", icon: "lucide:clock-3", disabled: !currentSlug.value },
]);
</script>

<template>
	<Sidebar :collapsible="collapsible" v-bind="props" class="border-sidebar-border bg-sidebar text-sidebar-foreground border-r">
		<SidebarHeader class="border-sidebar-border border-b px-3 py-4">
			<div class="hidden justify-center group-data-[collapsible=icon]:flex"><AppBrandMark size="sm" /></div>
			<div class="mb-4 px-1 group-data-[collapsible=icon]:hidden"><AppBrandMark size="sm" show-name inverted /></div>
			<WorkspaceSwitcher />
		</SidebarHeader>

		<SidebarContent class="gap-6 px-2.5 py-5">
			<SidebarGroup>
				<SidebarGroupLabel class="text-2xs text-rail-muted px-2 text-[11px] font-semibold group-data-[collapsible=icon]:hidden">
					<span>Workspace</span>
				</SidebarGroupLabel>

				<SidebarMenu>
					<SidebarMenuItem v-for="option in workspaceNav" :key="option.title" class="group/menu-item">
						<SidebarMenuButton
							:tooltip="option.disabled ? 'Create a workspace first' : option.title"
							as-child
							:is-active="option.isActive"
							class="focus-ring text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground h-11 rounded-xl px-3 text-sm group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:bg-transparent data-[active=true]:font-semibold"
						>
							<NuxtLink :to="option.disabled ? '' : option.url" class="relative" :aria-disabled="option.disabled" :tabindex="option.disabled ? -1 : undefined">
								<span v-if="option.isActive" class="bg-primary absolute top-1/2 -left-3 h-6 w-1 -translate-y-1/2 rounded-r-full" />
								<Icon :name="option.icon" :size="16" class="shrink-0" />
								<span class="group-data-[collapsible=icon]:hidden">{{ option.title }}</span>
								<span class="text-2xs text-text-tertiary ml-auto group-data-[collapsible=icon]:hidden">{{ option.shortcut }}</span>
							</NuxtLink>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroup>

			<SidebarGroup>
				<SidebarGroupLabel class="text-2xs text-rail-muted px-2 text-[11px] font-semibold group-data-[collapsible=icon]:hidden">
					<span>My tasks</span>
				</SidebarGroupLabel>
				<SidebarMenu>
					<SidebarMenuItem v-for="option in myWorkNav" :key="option.title">
						<SidebarMenuButton
							:tooltip="option.disabled ? 'Create a workspace first' : option.title"
							as-child
							:is-active="option.isActive"
							class="focus-ring text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground h-11 rounded-xl px-3 text-sm group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:bg-transparent data-[active=true]:font-semibold"
						>
							<NuxtLink :to="option.disabled ? '' : option.url" class="relative" :aria-disabled="option.disabled" :tabindex="option.disabled ? -1 : undefined">
								<span v-if="option.isActive" class="bg-primary absolute top-1/2 -left-3 h-6 w-1 -translate-y-1/2 rounded-r-full" />
								<Icon :name="option.icon" :size="16" class="shrink-0" />
								<span class="group-data-[collapsible=icon]:hidden">{{ option.title }}</span>
							</NuxtLink>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroup>
		</SidebarContent>

		<SidebarFooter class="border-sidebar-border border-t p-3">
			<NavUser />
		</SidebarFooter>
	</Sidebar>
</template>
