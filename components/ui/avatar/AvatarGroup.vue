<script lang="ts" setup>
import { computed } from "vue";
import type { BaseUser } from "~/types";

interface GroupAvatarProps {
	users: Array<BaseUser & { isOnline?: boolean }>;
	maxDisplayed?: number;
	size?: string;
	className?: string;
}

const props = defineProps<GroupAvatarProps>();

const displayedUsers = computed(() => props.users.slice(0, props.maxDisplayed ?? 4));
const remainingCount = computed(() => props.users.length - displayedUsers.value.length);
const tooltipText = computed(() => props.users.map((user: BaseUser) => `${user.firstName} ${user.lastName}`.trim() || user.username).join(", "));

const initials = (first?: string, last?: string, username?: string) => {
	if (first || last) {
		return `${first?.[0]?.toUpperCase() || ""}${last?.[0]?.toUpperCase() || ""}`;
	}
	return (username || "").slice(0, 2).toUpperCase();
};
</script>

<template>
	<TooltipProvider>
		<Tooltip>
			<TooltipTrigger as-child>
				<div :class="['flex items-center -space-x-2', className]">
					<div v-for="user in displayedUsers" :key="user.id" class="relative">
						<Avatar :class="[size, 'ring-surface-0 border-border bg-surface-0 border ring-2']">
							<AvatarImage :src="user.profilePicture || ''" :alt="user.username" />
							<AvatarFallback class="bg-accent-subtle text-accent-text font-semibold">
								{{ initials(user.firstName, user.lastName, user.username) }}
							</AvatarFallback>
						</Avatar>
						<span v-if="user.isOnline" class="ring-surface-0 bg-success absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full ring-2" aria-hidden="true" />
					</div>

					<Avatar v-if="remainingCount > 0" :class="[size, 'ring-surface-0 border-border bg-surface-0 border ring-2']">
						<AvatarFallback class="bg-surface-2 text-text-secondary font-medium">+{{ remainingCount }}</AvatarFallback>
					</Avatar>
				</div>
			</TooltipTrigger>
			<TooltipContent>{{ tooltipText }}</TooltipContent>
		</Tooltip>
	</TooltipProvider>
</template>
