<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import type { Notification } from "@/types";

const { user } = storeToRefs(useStore());
const fetchNotifications = async () => {
	const { data } = await useApiFetch<{ success: boolean; data: Notification[] }>(`/api/notifications/${user.value?.id}`);
	return data;
};

const { data: notifications } = useQuery({
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
	<div class="space-y-4">
		<div v-for="notification in notifications" :key="notification.id" class="flex items-start gap-3 rounded-xl border p-4 transition hover:bg-gray-50">
			<img v-if="notification.user" :src="notification.user.profilePicture" alt="actor" class="h-10 w-10 rounded-full object-cover" />
			<div class="flex-1">
				<p class="text-sm text-gray-700">
					<strong>{{ notification.user.firstName }} {{ notification.user.lastName }}</strong>
					<span v-if="notification.type === 'mention'">mentioned you</span>
					<span v-else-if="notification.type === 'comment_reply'">replied to a comment</span>
					in task <strong>"{{ notification.task.title }}"</strong>
				</p>
				<p class="mt-1 text-xs text-gray-500">{{ formatDate(notification.createdAt) }}</p>
				<p v-if="notification.comment" class="mt-2 text-sm text-gray-600 italic">“{{ notification.comment.content }}”</p>
			</div>
		</div>
	</div>
</template>
