<script lang="ts" setup>
import type { BaseUser } from "~/types";

interface GroupAvatarProps {
	users: BaseUser[];
	maxDisplayed?: number;
	size?: string;
	className?: string;
}

const props = defineProps<GroupAvatarProps>();

const displayedUsers = computed(() => props.users.slice(0, props.maxDisplayed ?? 3));
const remainingCount = computed(() => props.users.length - displayedUsers.value.length);
</script>

<template>
	<div :class="['flex items-center -space-x-2', className]">
		<Avatar v-for="user in displayedUsers" :key="user.id" :class="[size, 'border-background border-2 dark:border-gray-800']">
			<AvatarImage :src="user.profilePicture || ''" :alt="user.username" />
			<AvatarFallback>{{ getInitials(user.firstName, user.lastName) }}</AvatarFallback>
		</Avatar>

		<Avatar v-if="remainingCount > 0" :class="[size, 'border-background border-2 dark:border-gray-800']">
			<AvatarFallback>+{{ remainingCount }}</AvatarFallback>
		</Avatar>
	</div>
</template>
