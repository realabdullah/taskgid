<script lang="ts" setup>
import { storeToRefs } from "pinia";

import { useStore } from "~/stores";
import { useWorkspacesStore } from "~/stores/workspaces";

const { user } = storeToRefs(useStore());
const commandPaletteOpen = useState<boolean>("command-palette-open", () => false);
const switchboardOpen = useState<boolean>("workspace-switchboard-open", () => false);
const { workspaces } = storeToRefs(useWorkspacesStore());
const route = useRoute();
const currentWorkspace = computed(() => workspaces.value?.find((workspace) => workspace.slug === route.params.slug));
const { logout } = useLogout();

const openCommandPalette = () => {
	commandPaletteOpen.value = true;
};

const openUserSettings = () => {
	window.dispatchEvent(new CustomEvent("taskgid:open-settings-intent"));
};

const openUserProfile = () => {
	window.dispatchEvent(new CustomEvent("taskgid:open-profile-intent"));
};

const workspaceTabs = computed(() => {
	if (!currentWorkspace.value) return [];
	const root = `/app/workspaces/${currentWorkspace.value.slug}`;
	return [
		{ label: "Overview", to: root, active: route.name === "workspaces-slug" },
		{ label: "Tasks", to: `${root}/tasks`, active: route.name === "tasks" },
		{ label: "People", to: `${root}/team`, active: route.name === "workspaces-slug-team" },
	];
});
</script>

<template>
	<header class="bg-canvas/90 border-border sticky top-0 z-20 border-b backdrop-blur-md">
		<div class="relative grid min-h-17 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-4 sm:grid-cols-[1fr_auto_1fr] sm:gap-4 sm:px-8">
			<div class="flex min-w-0 items-center gap-3">
				<button
					type="button"
					class="focus-ring text-text-primary hover:bg-surface-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-sm p-0 text-left sm:h-auto sm:w-auto sm:min-w-0 sm:justify-start sm:gap-2 sm:px-2 sm:py-1.5"
					aria-label="Switch workspace"
					@click="switchboardOpen = true"
				>
					<div class="bg-signal-subtle text-signal flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-extrabold">
						{{ (currentWorkspace?.title || "WS").slice(0, 1).toUpperCase() }}
					</div>
					<span class="text-text-primary hidden max-w-32 truncate text-sm font-bold sm:block">{{ currentWorkspace?.title || "Select workspace" }}</span>
					>
					<Icon name="lucide:chevrons-up-down" :size="14" class="text-text-tertiary hidden shrink-0 sm:block" />
				</button>
			</div>

			<Button
				variant="ghost"
				class="focus-ring border-border h-10 w-full min-w-0 justify-center rounded-sm px-3 text-sm sm:w-[min(42vw,520px)] sm:justify-between sm:border sm:px-4"
				aria-label="Search tasks and workspaces"
				@click="openCommandPalette"
			>
				<span class="text-text-secondary flex items-center gap-2"><Icon name="hugeicons:search-01" :size="16" /><span class="hidden sm:inline">Search tasks and workspaces...</span></span>
				<span class="bg-surface-2 text-text-secondary hidden rounded-md px-1.5 py-0.5 font-mono text-[10px] leading-none sm:inline">⌘K</span>
			</Button>

			<div class="flex items-center justify-end gap-2">
				<AppNotificationInbox />
				<DropdownMenu>
					<DropdownMenuTrigger as-child>
						<button type="button" class="focus-ring hover:bg-surface-2 flex h-10 min-w-0 items-center gap-2 rounded-sm pr-2 pl-1 text-left" aria-label="Open account menu">
							<Avatar class="h-7 w-7 shrink-0"
								><AvatarImage :src="user?.profilePicture || ''" /><AvatarFallback class="bg-accent-soft text-accent-text text-2xs">{{
									getInitials(user?.firstName, user?.lastName)
								}}</AvatarFallback></Avatar
							><span class="text-text-secondary hidden max-w-32 truncate text-sm font-medium sm:inline">{{ user?.firstName }} {{ user?.lastName }}</span>
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" :side-offset="8" class="border-border bg-surface-0 w-60 border p-1">
						<DropdownMenuLabel class="px-3 py-2 font-normal">
							<p class="text-text-primary truncate text-sm font-semibold">{{ user?.firstName }} {{ user?.lastName }}</p>
							<p class="text-text-tertiary mt-0.5 truncate text-xs">{{ user?.email }}</p>
						</DropdownMenuLabel>
						<DropdownMenuSeparator class="border-border my-1" />
						<DropdownMenuItem @select="openUserProfile"><Icon name="lucide:user" :size="15" /> Profile</DropdownMenuItem>
						<DropdownMenuItem @select="openUserSettings"><Icon name="lucide:settings" :size="15" /> Account settings</DropdownMenuItem>
						<DropdownMenuSeparator class="border-border my-1" />
						<DropdownMenuItem variant="destructive" @select="logout"><Icon name="hugeicons:logout-03" :size="15" /> Log out</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>

		<nav v-if="workspaceTabs.length" class="no-scrollbar border-border flex gap-1 overflow-x-auto border-t px-4 sm:px-8" aria-label="Workspace sections">
			<NuxtLink
				v-for="tab in workspaceTabs"
				:key="tab.label"
				:to="tab.to"
				class="interactive relative px-3 py-3 text-sm font-semibold"
				:class="tab.active ? 'text-primary' : 'text-text-tertiary hover:text-text-primary'"
			>
				{{ tab.label }}<span v-if="tab.active" class="bg-primary absolute inset-x-3 bottom-0 h-0.5 rounded-full" />
			</NuxtLink>
		</nav>
	</header>
</template>
