<script setup lang="ts">
import { useSidebar } from "@/components/ui/sidebar";

const { user } = storeToRefs(useStore());
const { isMobile } = useSidebar();

const viewProfile = () => {
	window.dispatchEvent(new CustomEvent("taskgid:open-profile-intent"));
};

const viewSettings = () => {
	window.dispatchEvent(new CustomEvent("taskgid:open-settings-intent"));
};
</script>

<template>
	<SidebarMenu>
		<SidebarMenuItem>
			<DropdownMenu>
				<DropdownMenuTrigger as-child>
					<SidebarMenuButton size="lg" class="linear-shell hover:bg-surface-2 data-[state=open]:bg-surface-2 h-10 rounded-md px-2">
						<Avatar class="h-8 w-8">
							<AvatarImage :src="user?.profilePicture || ''" :alt="user?.username" />
							<AvatarFallback class="bg-accent-soft text-accent-text">{{ getInitials(user?.firstName, user?.lastName) }}</AvatarFallback>
						</Avatar>
						<div class="grid flex-1 text-left leading-tight">
							<span class="text-text-primary truncate text-sm font-medium">{{ user?.firstName }} {{ user?.lastName }}</span>
							<span class="text-2xs text-text-tertiary truncate">Member</span>
						</div>
						<Icon name="lucide:chevrons-up-down" :size="14" class="text-text-tertiary" />
					</SidebarMenuButton>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					class="border-border bg-surface-0 w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg border p-1"
					:side="isMobile ? 'bottom' : 'right'"
					align="end"
					:side-offset="4"
				>
					<DropdownMenuLabel class="p-0 font-normal">
						<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
							<Avatar class="h-8 w-8">
								<AvatarImage :src="user?.profilePicture || ''" :alt="user?.username" />
								<AvatarFallback class="bg-accent-soft text-accent-text">{{ getInitials(user?.firstName, user?.lastName) }}</AvatarFallback>
							</Avatar>
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="text-text-primary truncate font-semibold">{{ user?.firstName }} {{ user?.lastName }}</span>
								<span class="text-text-tertiary truncate text-xs">{{ user?.email }}</span>
							</div>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator class="border-border my-1" />
					<DropdownMenuItem class="text-text-secondary hover:bg-surface-2 hover:text-text-primary h-8 rounded-md px-2 text-sm" @select="viewProfile">
						<Icon name="lucide:user" :size="14" />
						View profile
					</DropdownMenuItem>
					<DropdownMenuItem class="text-text-secondary hover:bg-surface-2 hover:text-text-primary h-8 rounded-md px-2 text-sm" @select="viewSettings">
						<Icon name="lucide:settings" :size="14" />
						Settings
					</DropdownMenuItem>
					<DropdownMenuSeparator class="border-border my-1" />
					<DropdownMenuItem @select="useAuth().logout">
						<Icon name="hugeicons:logout-03" :size="16" />
						Log out
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</SidebarMenuItem>
	</SidebarMenu>
</template>
