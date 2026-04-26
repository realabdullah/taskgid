<script lang="ts" setup>
import { storeToRefs } from "pinia";

import { useStore } from "~/stores";

const { user } = storeToRefs(useStore());
const commandPaletteOpen = useState<boolean>("command-palette-open", () => false);

const openCommandPalette = () => {
	commandPaletteOpen.value = true;
};
</script>

<template>
	<header class="border-border bg-surface-0 linear-rule sticky top-0 z-20 grid h-14 w-full grid-cols-3 items-center border-b px-3 md:px-4">
		<div class="flex items-center gap-1">
			<SidebarTrigger class="text-text-tertiary hover:text-text-primary shrink-0" />
			<div class="bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white shadow-sm">
				<Icon name="hugeicons:checkmark-circle-03" :size="16" />
			</div>
			<div class="leading-tight">
				<span class="linear-title text-lg font-semibold">TaskGid</span>
				<p class="text-2xs text-text-tertiary hidden md:block">Focused execution workspace</p>
			</div>
		</div>

		<div class="flex justify-center">
			<Button variant="secondary" class="border-border-strong h-9 w-full max-w-md justify-between rounded-full px-3 text-sm shadow-xs" @click="openCommandPalette">
				<span class="text-text-secondary flex items-center gap-2">
					<Icon name="hugeicons:search-01" :size="16" />
					<span class="hidden sm:inline">Search tasks and workspaces...</span>
					<span class="sm:hidden">Search...</span>
				</span>
				<span class="border-border bg-surface-0 text-text-tertiary rounded-md border px-1.5 py-0.5 text-[10px] leading-none font-medium">⌘K</span>
			</Button>
		</div>

		<div class="flex items-center justify-end gap-2">
			<AppNotificationInbox />

			<div class="border-border bg-surface-0 hidden h-9 min-w-0 items-center gap-2 rounded-full border px-3 sm:flex">
				<Avatar class="h-6 w-6 shrink-0">
					<AvatarImage :src="user?.profilePicture || ''" />
					<AvatarFallback class="bg-accent-soft text-accent-text text-2xs">{{ getInitials(user?.firstName, user?.lastName) }}</AvatarFallback>
				</Avatar>
				<span class="text-text-secondary truncate text-sm font-medium">{{ user?.firstName }} {{ user?.lastName }}</span>
			</div>
		</div>
	</header>
</template>
