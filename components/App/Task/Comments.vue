<script lang="ts" setup>
import { getWorkspaceTeams } from "~/utils/apis/workspace";

const comments = [
	{
		id: 1,
		user: {
			name: "Jane Smith",
			avatar: "/placeholder.svg?height=32&width=32",
			initials: "JS",
		},
		content: "I've started working on the hero section. Should we use the new illustrations from the brand kit?",
		timestamp: "2 days ago",
		likes: 2,
		userLiked: true,
	},
	{
		id: 2,
		user: {
			name: "Alex Johnson",
			avatar: "/placeholder.svg?height=32&width=32",
			initials: "AJ",
		},
		content: "Yes, please use the new illustrations. Also, make sure the mobile version has proper spacing.",
		timestamp: "1 day ago",
		likes: 1,
		userLiked: false,
	},
	{
		id: 3,
		user: {
			name: "John Doe",
			avatar: "/placeholder.svg?height=32&width=32",
			initials: "JD",
		},
		content: "I've updated the color palette in Figma. You can find it in the shared design system folder.",
		timestamp: "5 hours ago",
		likes: 0,
		userLiked: false,
	},
];

const { data: teams } = await getWorkspaceTeams(useRoute().params.slug as string);
</script>

<template>
	<div class="space-y-4">
		<div v-for="comment in comments" :key="comment.id" class="flex gap-4">
			<Avatar class="h-8 w-8">
				<AvatarImage :src="comment.user.avatar" :alt="comment.user.name" />
				<AvatarFallback>{{ comment.user.initials }}</AvatarFallback>
			</Avatar>
			<div class="flex-1 space-y-1">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<span class="text-sm font-medium">{{ comment.user.name }}</span>
						<span class="text-muted-foreground text-xs">{{ comment.timestamp }}</span>
					</div>
				</div>
				<p class="text-sm">{{ comment.content }}</p>
			</div>
		</div>

		<AppTaskCommentEditor />
	</div>
</template>
