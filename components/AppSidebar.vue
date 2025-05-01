<script setup lang="ts">
import { useSidebar, type SidebarProps } from "@/components/ui/sidebar";

const props = withDefaults(defineProps<SidebarProps>(), {
	collapsible: "icon",
});

useWorkspaceStore();
const { isMobile } = useSidebar();
const route = useRoute();
const data = computed(() => ({
	navigations: [
		{ title: "Home", url: `/app/workspaces/${route.params.slug}`, isActive: route.name === "workspaces-slug", icon: "hugeicons:home-05" },
		{ title: "Tasks", url: `/app/workspaces/${route.params.slug}/tasks`, isActive: route.name === "workspaces-slug-tasks", icon: "hugeicons:task-done-01" },
		{ title: "Team", url: `/app/workspaces/${route.params.slug}/team`, isActive: route.name === "workspaces-slug-team", icon: "hugeicons:user-group-02" },
		{ title: "Settings", url: `/app/workspaces/${route.params.slug}/settings`, isActive: route.name === "workspaces-slug-settings", icon: "hugeicons:settings-01" },
	],
	tasks: [
		{ title: "Design Engineering", url: "#", isActive: false, icon: "hugeicons:keyframes-multiple" },
		{ title: "Sales & Marketing", url: "#", isActive: false, icon: "hugeicons:keyframes-multiple" },
		{ title: "Travel", url: "#", isActive: false, icon: "hugeicons:keyframes-multiple" },
	],
}));

const taskOptions = computed(() => [
	{ title: "View Tasks", icon: "hugeicons:task-01", action: () => {} },
	{ title: "Share Tasks", icon: "hugeicons:folder-shared-02", action: () => {} },
	{ title: "Delete Tasks", icon: "hugeicons:delete-04", action: () => {} },
]);
</script>

<template>
	<Sidebar v-bind="props">
		<SidebarHeader>
			<WorkspaceSwitcher />
		</SidebarHeader>

		<SidebarContent>
			<SidebarGroup v-for="(options, title) in data" :key="title" :class="{ 'group-data-[collapsible=icon]:hidden': title === 'tasks' }">
				<SidebarGroupLabel>
					<span class="capitalize">{{ title }}</span>
				</SidebarGroupLabel>

				<SidebarMenu>
					<SidebarMenuItem v-for="option in options" :key="option.title">
						<SidebarMenuButton :tooltip="option.title" as-child>
							<NuxtLink :to="option.url">
								<Icon :name="option.icon" :size="18" class="text-sidebar-foreground/70" />
								<span>{{ option.title }}</span>
							</NuxtLink>
						</SidebarMenuButton>

						<DropdownMenu v-if="title === 'tasks'">
							<DropdownMenuTrigger as-child>
								<SidebarMenuAction show-on-hover>
									<Icon name="hugeicons:more-horizontal-circle-01" :size="16" class="text-sidebar-foreground/70" />
									<span class="sr-only">More</span>
								</SidebarMenuAction>
							</DropdownMenuTrigger>

							<DropdownMenuContent class="w-48 rounded-lg" :side="isMobile ? 'bottom' : 'right'" :align="isMobile ? 'end' : 'start'">
								<template v-for="task in taskOptions" :key="task.title">
									<DropdownMenuSeparator v-if="task.title === 'Delete Tasks'" />
									<DropdownMenuItem @click="task.action">
										<Icon :name="task.icon" :size="16" class="text-muted-foreground" />
										<span>{{ task.title }}</span>
									</DropdownMenuItem>
								</template>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroup>
		</SidebarContent>

		<SidebarFooter>
			<NavUser />
		</SidebarFooter>

		<SidebarRail />
	</Sidebar>
</template>
