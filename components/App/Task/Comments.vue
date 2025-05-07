<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { getWorkspaceTeams } from "~/utils/apis/workspace";

defineProps<{ comments: any }>();

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
