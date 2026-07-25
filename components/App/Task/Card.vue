<script lang="ts" setup>
import { getStatusIcon } from "#imports";
import { AvatarGroup } from "~/components/ui/avatar";
import type { Task } from "~/types";

const props = defineProps<{ task: Task }>();
const emits = defineEmits<(event: "edit" | "delete") => void>();

const taskUrl = computed(() => {
	return `/app/workspaces/${useRoute().params.slug}/tasks/${props.task.id}`;
});

const taskIcon = computed(() => getStatusIcon(props.task.status));
const description = computed(() =>
	props.task.description
		?.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ")
		.trim()
);
const dueLabel = computed(() => (props.task.dueDate ? `Due ${getTimeAgo(new Date(props.task.dueDate))}` : "No due date"));
</script>

<template>
	<article
		class="interactive group border-border hover:bg-surface-1 grid min-h-18 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b px-1 py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_110px_180px_104px] sm:px-3"
	>
		<NuxtLink :to="taskUrl" class="max-w-[420px] min-w-0">
			<div class="flex min-w-0 items-center gap-2">
				<Icon :name="taskIcon.icon" :size="15" :class="taskIcon.class" />
				<p class="text-text-primary truncate text-sm font-bold">{{ task.title }}</p>
			</div>
			<p v-if="description" class="text-text-tertiary mt-1 truncate text-xs">{{ description }}</p>
		</NuxtLink>
		<div class="hidden sm:block">
			<Badge variant="outline" :class="[getPriorityColor(task.priority), 'rounded-sm']">{{ task.priority }}</Badge>
		</div>
		<p class="text-text-secondary hidden truncate text-xs sm:block">{{ dueLabel }}</p>
		<div class="flex items-center justify-end gap-2">
			<AvatarGroup v-if="task.assignees.length > 0" :users="task.assignees" :max-displayed="3" size="sm" />
			<DropdownMenu @click.prevent>
				<DropdownMenuTrigger as-child>
					<Button variant="ghost" size="icon" class="h-9 w-9 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
						<Icon name="hugeicons:more-horizontal-circle-01" size="16" />
						<span class="sr-only">Task menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem @select="emits('edit')">Edit task</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem variant="destructive" @select="emits('delete')">Delete task</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	</article>
</template>
