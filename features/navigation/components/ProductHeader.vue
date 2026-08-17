<script setup lang="ts">
import { storeToRefs } from "pinia";

import { useLogout } from "~/composables/useLogout";
import { NotificationInbox } from "~/features/notifications";
import { useStore } from "~/stores";
import { useWorkspacesStore } from "~/features/workspaces/stores";

const route = useRoute();
const { user } = storeToRefs(useStore());
const { workspaces } = storeToRefs(useWorkspacesStore());
const { logout } = useLogout();
const commandPaletteOpen = useState<boolean>("command-palette-open", () => false);
const switchboardOpen = useState<boolean>("workspace-switchboard-open", () => false);

const currentWorkspace = computed(() => workspaces.value?.find((workspace) => workspace.slug === route.params.slug) ?? workspaces.value?.[0]);
const workspaceRoot = computed(() => (currentWorkspace.value ? `/app/workspaces/${currentWorkspace.value.slug}` : "/app"));
const hasWorkspace = computed(() => Boolean(currentWorkspace.value));

const accountMenu = [
	{ section: "profile", label: "Profile", icon: "lucide:user-round" },
	{ section: "account", label: "Password", icon: "lucide:shield-check" },
	{ section: "security", label: "Passkeys and devices", icon: "lucide:key-round" },
	{ section: "preferences", label: "Preferences", icon: "lucide:sliders-horizontal" },
];

const navigation = computed(() => [
	{ label: "Home", to: "/app", active: route.name === "app" },
	{ label: "My tasks", to: "/app/tasks", active: route.name === "my-tasks" },
	{ label: "Workspace", to: workspaceRoot.value, active: route.name === "workspaces-slug" || route.name === "workspaces-slug-settings" },
	{ label: "Tasks", to: hasWorkspace.value ? `${workspaceRoot.value}/tasks` : "/app", active: route.name === "tasks" || route.name === "task-id" },
	{ label: "People", to: hasWorkspace.value ? `${workspaceRoot.value}/team` : "/app", active: route.name === "workspaces-slug-team" },
]);
</script>

<template>
	<header class="border-border bg-surface-0/95 sticky top-0 z-30 border-b backdrop-blur-xl">
		<div class="mx-auto flex h-14 max-w-[1540px] items-center gap-3 px-4 sm:px-6 lg:px-10">
			<NuxtLink to="/app" class="focus-ring rounded-md" aria-label="Taskgid home"><AppBrandMark size="sm" /></NuxtLink>
			<div class="bg-surface-3 h-5 w-px" />
			<Button type="button" variant="ghost" size="sm" class="min-w-0 px-2" @click="switchboardOpen = true">
				<span class="border-border bg-surface-1 flex h-6 w-6 items-center justify-center rounded-md border text-[10px] font-semibold">{{
					currentWorkspace?.title?.[0]?.toUpperCase() || "W"
				}}</span>
				<span class="text-text-primary hidden max-w-36 truncate text-sm font-medium sm:block">{{ currentWorkspace?.title || "Select workspace" }}</span>
				<Icon name="lucide:chevrons-up-down" :size="13" class="text-text-tertiary" />
			</Button>

			<nav class="ms-2 hidden h-full items-center gap-1 md:flex" aria-label="Main navigation">
				<NuxtLink
					v-for="item in navigation"
					:key="item.label"
					:to="item.to"
					:aria-current="item.active ? 'page' : undefined"
					class="focus-ring relative flex h-full items-center px-3 text-sm font-medium transition-colors"
					:class="item.active ? 'text-text-primary' : 'text-text-tertiary hover:text-text-primary'"
				>
					{{ item.label }}
					<span v-if="item.active" class="bg-text-primary absolute inset-x-3 bottom-0 h-0.5" />
				</NuxtLink>
			</nav>

			<div class="ms-auto flex items-center gap-1">
				<Button type="button" variant="ghost" size="sm" class="text-text-tertiary sm:border-border sm:bg-surface-1 h-8 px-2.5 text-xs sm:border sm:pe-2" @click="commandPaletteOpen = true">
					<Icon name="lucide:search" :size="15" /><span class="hidden lg:inline">Search</span><kbd class="text-text-disabled hidden font-mono text-xs lg:inline">⌘K</kbd>
				</Button>
				<NotificationInbox />
				<DropdownMenu>
					<DropdownMenuTrigger as-child>
						<Button type="button" variant="ghost" class="h-9 px-1.5" aria-label="Open account menu">
							<Avatar class="h-7 w-7"
								><AvatarImage :src="user?.profilePicture || ''" /><AvatarFallback class="bg-text-primary text-primary-foreground text-[10px]">{{
									getInitials(user?.firstName, user?.lastName)
								}}</AvatarFallback></Avatar
							>
							<Icon name="lucide:chevron-down" :size="12" class="text-text-tertiary hidden sm:block" />
						</Button>
					</DropdownMenuTrigger>
					<!--
						"Profile" and "Settings" both opened /app/settings, so the menu asked the
						user to choose between two doors into the same room. The menu now names the
						four settings sections directly and deep-links to each one.
					-->
					<DropdownMenuContent align="end" :side-offset="8" class="w-64 p-1.5">
						<DropdownMenuLabel class="px-2.5 py-2 font-normal"
							><p class="truncate text-sm font-medium">{{ user?.firstName }} {{ user?.lastName }}</p>
							<p class="text-text-tertiary mt-0.5 truncate text-xs">{{ user?.email }}</p></DropdownMenuLabel
						>
						<DropdownMenuSeparator />
						<DropdownMenuItem v-for="item in accountMenu" :key="item.section" @select="navigateTo(`/app/settings?section=${item.section}`)">
							<Icon :name="item.icon" :size="15" />{{ item.label }}
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem variant="destructive" @select="logout"><Icon name="lucide:log-out" :size="15" />Log out</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	</header>
</template>
