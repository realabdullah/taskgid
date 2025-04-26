<script lang="ts" setup>
import { toast } from "vue-sonner";

defineEmits<(event: "view-profile") => void>();

const { user } = storeToRefs(useStore());

const logout = async () => {
	await useApiFetch("/auth/logout", { method: "POST" });
	toast("Logged out successfully.");
	useCookie("TG-AUTHTOKEN").value = undefined;
	return navigateTo("/login");
};
</script>

<template>
	<header class="bg-background sticky top-0 z-10 flex h-16 items-center justify-between border-b px-4 md:px-6">
		<div class="flex items-center gap-2">
			<div class="bg-primary flex h-8 w-8 items-center justify-center rounded-md">
				<Icon name="hugeicons:checkmark-circle-03" :size="16" class="text-primary-foreground" />
			</div>
			<span class="font-semibold">TaskGid</span>
		</div>

		<div class="flex items-center gap-3">
			<div class="relative hidden md:block">
				<Icon name="hugeicons:search-01" :size="16" class="text-muted-foreground absolute top-2.5 left-2.5" />
				<Input type="search" placeholder="Search..." class="w-[200px] rounded-full pl-8 md:w-[300px]" />
			</div>
			<Button variant="ghost" size="icon" class="relative">
				<Icon name="hugeicons:notification-02" :size="20" />
				<span class="bg-primary absolute top-2 right-2 h-2 w-2 rounded-full"></span>
			</Button>
			<DropdownMenu>
				<DropdownMenuTrigger as-child>
					<Button variant="ghost" class="gap-2">
						<Avatar class="h-8 w-8">
							<AvatarImage :src="user?.profilePicture || ''" />
							<AvatarFallback>{{ getInitials(user?.firstName, user?.lastName) }}</AvatarFallback>
						</Avatar>
						<div class="hidden text-left md:block">
							<p class="text-sm font-medium">{{ `${user?.firstName} ${user?.lastName}` }}</p>
						</div>
						<Icon name="hugeicons:arrow-down-01" :size="16" class="opacity-50" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" class="w-56">
					<DropdownMenuLabel>My Account</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem @select="$emit('view-profile')">
						<Icon name="hugeicons:user-03" :size="16" class="mr-2" />
						Profile
					</DropdownMenuItem>

					<DropdownMenuItem>
						<Icon name="hugeicons:setting-07" :size="16" class="mr-2" />
						Settings
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem @select="logout">
						<Icon name="hugeicons:logout-03" :size="16" class="mr-2" />
						Log out
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	</header>
</template>
