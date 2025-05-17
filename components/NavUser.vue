<script setup lang="ts">
import { useSidebar } from "@/components/ui/sidebar";

const { user } = storeToRefs(useStore());
const { isMobile } = useSidebar();
</script>

<template>
	<SidebarMenu>
		<SidebarMenuItem>
			<DropdownMenu>
				<DropdownMenuTrigger as-child>
					<SidebarMenuButton size="lg" class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
						<Avatar class="h-8 w-8 rounded-lg">
							<AvatarImage :src="user?.profilePicture || ''" :alt="user?.username" />
							<AvatarFallback class="rounded-lg">{{ getInitials(user?.firstName, user?.lastName) }}</AvatarFallback>
						</Avatar>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-medium">{{ user?.firstName }} {{ user?.lastName }}</span>
							<span class="truncate text-xs">{{ user?.email }}</span>
						</div>
						<Icon name="hugeicons:square-arrow-data-transfer-vertical" :size="16" class="ml-auto" />
					</SidebarMenuButton>
				</DropdownMenuTrigger>
				<DropdownMenuContent class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg" :side="isMobile ? 'bottom' : 'right'" align="end" :side-offset="4">
					<DropdownMenuLabel class="p-0 font-normal">
						<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
							<Avatar class="h-8 w-8 rounded-lg">
								<AvatarImage :src="user?.profilePicture || ''" :alt="user?.username" />
								<AvatarFallback class="rounded-lg">{{ getInitials(user?.firstName, user?.lastName) }}</AvatarFallback>
							</Avatar>
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-semibold">{{ user?.firstName }} {{ user?.lastName }}</span>
								<span class="truncate text-xs">{{ user?.email }}</span>
							</div>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem @select="useAuth().logout">
						<Icon name="hugeicons:logout-03" :size="16" />
						Log out
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</SidebarMenuItem>
	</SidebarMenu>
</template>
