<script lang="ts" setup>
import { getStatusIcon } from "#imports";
import { Card } from "@/components/ui/card";
import { AvatarGroup } from "~/components/ui/avatar";
import type { Task } from "~/types";

const props = defineProps<{ task: Task }>();
const emits = defineEmits<(event: "edit" | "delete") => void>();

const taskUrl = computed(() => {
	return `/app/workspaces/${useRoute().params.slug}/tasks/${props.task.id}`;
});

const taskIcon = computed(() => getStatusIcon(props.task.status));
</script>

<template>
	<NuxtLink :to="taskUrl" class="block">
		<Card class="overflow-hidden transition-shadow hover:shadow-md">
			<CardHeader class="p-4 pb-0">
				<div class="flex items-start justify-between">
					<div class="space-y-1">
						<CardTitle class="text-lg">{{ task.title }}</CardTitle>
						<CardDescription class="line-clamp-2">{{ task.description }}</CardDescription>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger as-child>
							<Button variant="ghost" size="icon" class="h-8 w-8">
								<Icon name="hugeicons:more-horizontal-circle-01" size="16" />
								<span className="sr-only">Task menu</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>Actions</DropdownMenuLabel>
							<DropdownMenuItem @select="emits('edit')">Edit Task</DropdownMenuItem>
							<DropdownMenuItem>Assign Task</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem class="text-rose-500" @select="emits('delete')">Delete Task</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardHeader>

			<CardContent class="p-4">
				<div class="flex flex-col space-y-4">
					<div class="flex flex-wrap items-center gap-2 text-sm">
						<div className="flex items-center">
							<Icon :name="taskIcon.icon" :size="16" :class="taskIcon.class" />
							<span className="ml-1 capitalize">{{ task.status.replace("_", " ") }}</span>
						</div>
						<div className="text-muted-foreground">•</div>
						<Badge variant="outline" :class="[getPriorityColor(task.priority)]"> {{ task.priority }} priority </Badge>
						<div className="text-muted-foreground">•</div>
						<div className="text-muted-foreground">Due {{ getTimeAgo(new Date(task.dueDate || "")) }}</div>
					</div>

					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<div v-if="task.assignees.length > 0" class="relative flex items-center gap-2">
								<AvatarGroup :users="task.assignees" :max-displayed="3" size="sm" class-name="border-background border-2 dark:border-gray-800" />
							</div>

							<Button v-else variant="outline" size="sm" class="h-7 text-xs">Assign</Button>
						</div>

						<div class="text-muted-foreground flex items-center text-sm">
							<Icon name="hugeicons:comment-02" size="16" class="mr-1" />
							{{ task.comments || 0 }} comment{{ task.comments !== 1 ? "s" : "" }}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	</NuxtLink>
</template>
