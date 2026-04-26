<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import type { Notification } from "@/types";

const { user } = storeToRefs(useStore());
const fetchNotifications = async () => {
	if (!user.value?.id) {
		return [] as Notification[];
	}

	const { success, data } = await useApiFetch<{ success: boolean; data: Notification[] }>(`/api/notifications/${user.value.id}`);
	if (!success || !data) {
		throw new Error("Failed to fetch notifications");
	}
	return data;
};

const {
	data: notifications,
	isPending: isNotificationsLoading,
	isError: isNotificationsError,
	error: notificationsError,
	refetch: refetchNotifications,
} = useQuery({
	queryKey: ["notifications"],
	queryFn: fetchNotifications,
});

const formatDate = (dateStr: string) => {
	return new Intl.DateTimeFormat("en", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(dateStr));
};
</script>

<template>
	<div class="space-y-3">
		<div v-if="isNotificationsLoading" class="space-y-2">
			<Skeleton class="h-20 w-full" />
			<Skeleton class="h-20 w-full" />
		</div>

		<AppEmptyState
			v-else-if="isNotificationsError"
			heading="Could not load notifications"
			:body="String(notificationsError || 'Your alerts could not be loaded. Retry in a few seconds.')"
			icon="lucide:alert-circle"
			:action="{ label: 'Retry', onClick: () => refetchNotifications(), variant: 'secondary' }"
		/>

		<template v-else-if="notifications?.length">
			<div v-for="notification in notifications" :key="notification.id" class="interactive border-border bg-surface-0 hover:bg-surface-2 flex items-start gap-3 rounded-lg border p-4">
				<img v-if="notification.user" :src="notification.user.profilePicture" alt="actor" class="h-10 w-10 rounded-full object-cover" />
				<div class="flex-1">
					<p class="text-text-secondary text-sm">
						<strong>{{ notification.user.firstName }} {{ notification.user.lastName }}</strong>
						<span v-if="notification.type === 'mention'">mentioned you</span>
						<span v-else-if="notification.type === 'comment_reply'">replied to your comment</span>
						in task <strong>"{{ notification.task.title }}"</strong>
					</p>
					<p class="text-2xs text-text-tertiary mt-1">{{ formatDate(notification.createdAt) }}</p>
					<p v-if="notification.comment" class="text-text-primary mt-2 text-sm italic">"{{ notification.comment.content }}"</p>
				</div>
			</div>
		</template>

		<AppEmptyState v-else heading="You're all caught up" body="New mentions, replies, and workspace updates will appear here." icon="lucide:bell-off" />
	</div>
</template>
