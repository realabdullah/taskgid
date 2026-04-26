<script setup lang="ts">
import { type SidebarProps } from "@/components/ui/sidebar";

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
	<Sidebar :collapsible="collapsible" v-bind="props" class="border-border bg-surface-1 border-r">
		<SidebarHeader class="linear-rule border-border border-b p-2">
			<WorkspaceSwitcher />
		</SidebarHeader>

		<SidebarContent class="gap-4 px-2 py-3">
			<SidebarGroup>
				<SidebarGroupLabel class="text-2xs text-text-tertiary px-2 font-semibold tracking-widest uppercase">
					<span>Workspace</span>
				</SidebarGroupLabel>

				<SidebarMenu>
					<SidebarMenuItem v-for="option in workspaceNav" :key="option.title" class="group/menu-item">
						<SidebarMenuButton
							:tooltip="option.disabled ? 'Create a workspace first' : option.title"
							as-child
							:is-active="option.isActive"
							class="text-text-secondary hover:bg-surface-2 hover:text-text-primary data-[active=true]:bg-accent-soft data-[active=true]:text-accent-strong h-8 rounded-md px-2 text-sm aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:bg-transparent data-[active=true]:font-medium"
						>
							<NuxtLink :to="option.disabled ? '' : option.url" class="relative" :aria-disabled="option.disabled" :tabindex="option.disabled ? -1 : undefined">
							<span v-if="option.isActive" class="bg-primary absolute top-1/2 -left-2.5 h-4 w-0.5 -translate-y-1/2 rounded-full" />
								<Icon :name="option.icon" :size="16" />
								<span>{{ option.title }}</span>
								<span class="text-2xs text-text-tertiary ml-auto group-data-[collapsible=icon]:hidden">{{ option.shortcut }}</span>
							</NuxtLink>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroup>

			<SidebarGroup>
				<SidebarGroupLabel class="text-2xs text-text-tertiary px-2 font-semibold tracking-widest uppercase">
					<span>My Work</span>
				</SidebarGroupLabel>
				<SidebarMenu>
					<SidebarMenuItem v-for="option in myWorkNav" :key="option.title">
						<SidebarMenuButton
							:tooltip="option.disabled ? 'Create a workspace first' : option.title"
							as-child
							:is-active="option.isActive"
							class="text-text-secondary hover:bg-surface-2 hover:text-text-primary data-[active=true]:bg-accent-soft data-[active=true]:text-accent-strong h-8 rounded-md px-2 text-sm aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:bg-transparent data-[active=true]:font-medium"
						>
							<NuxtLink :to="option.disabled ? '' : option.url" class="relative" :aria-disabled="option.disabled" :tabindex="option.disabled ? -1 : undefined">
								<span v-if="option.isActive" class="bg-primary absolute top-1/2 -left-2.5 h-4 w-0.5 -translate-y-1/2 rounded-full" />
								<Icon :name="option.icon" :size="16" />
								<span>{{ option.title }}</span>
							</NuxtLink>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroup>
		</SidebarContent>

		<SidebarFooter class="linear-rule border-border border-t p-2">
			<NavUser />
		</SidebarFooter>

		<SidebarRail />
	</Sidebar>
</template>
