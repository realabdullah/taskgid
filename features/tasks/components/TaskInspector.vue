<script lang="ts" setup>
import type { Task } from "~/types";
import { useTaskInspector } from "../composables/useTaskInspector";
import { TagChip } from "~/features/tags";
import TaskAttachments from "./TaskAttachments.vue";
import TaskChecklist from "./TaskChecklist.vue";
import TaskDescriptionEditor from "./TaskDescriptionEditor.vue";
import TaskMetadataHorizontal from "./TaskMetadataHorizontal.vue";
import TaskParentLink from "./TaskParentLink.vue";
import TaskSubtasks from "./TaskSubtasks.vue";
import TaskTimeline from "./TaskTimeline.vue";

const props = defineProps<{ workspaceSlug: string; taskId: string }>();
const emit = defineEmits<{ close: []; edit: [task: Task]; deleted: [] }>();
const {
	data: task,
	isPending,
	isError,
	error,
	refetch,
	deleteTask,
} = useTaskInspector({
	workspaceSlug: () => props.workspaceSlug,
	taskId: () => props.taskId,
	onDeleted: () => emit("deleted"),
});
</script>

<template>
	<aside class="product-panel flex min-h-0 flex-col overflow-hidden" :aria-label="task ? `Task details: ${task.title}` : 'Task details'">
		<header class="border-border flex items-center justify-between gap-3 border-b px-5 py-4">
			<!--
				The header is the only part that survives scrolling, so it carries the
				title. The id stays because it is what people quote to each other.
			-->
			<div class="min-w-0">
				<p class="text-text-primary truncate text-sm font-semibold">{{ task?.title || "Task details" }}</p>
				<p class="text-text-tertiary mt-0.5 truncate font-mono text-xs">{{ taskId }}</p>
			</div>
			<div class="flex items-center gap-1">
				<Button v-if="task" type="button" variant="ghost" size="sm" @click="emit('edit', task)"><Icon name="lucide:pencil" :size="15" /> Edit</Button>
				<DropdownMenu v-if="task">
					<DropdownMenuTrigger as-child
						><Button variant="ghost" size="icon" aria-label="Task actions"><Icon name="lucide:ellipsis" :size="17" /></Button
					></DropdownMenuTrigger>
					<DropdownMenuContent align="end"
						><DropdownMenuItem variant="destructive" @select="deleteTask"><Icon name="lucide:trash-2" :size="15" /> Delete task</DropdownMenuItem></DropdownMenuContent
					>
				</DropdownMenu>
				<Button type="button" variant="ghost" size="icon" aria-label="Close task" @click="emit('close')"><Icon name="lucide:x" :size="17" /></Button>
			</div>
		</header>

		<!--
			Tied to having nothing to show, not to fetching: editing a field or marking
			the task read refetches it, and a skeleton there would blank the panel
			under the reader mid-edit.
		-->
		<div v-if="isPending" class="space-y-4 p-5"><Skeleton class="h-9 w-2/3" /><Skeleton class="h-24 w-full" /><Skeleton class="h-48 w-full" /></div>
		<AppEmptyState
			v-else-if="isError"
			heading="Unable to load this task"
			:body="String(error || 'Check your connection and try again.')"
			icon="lucide:alert-circle"
			:action="{ label: 'Retry', onClick: () => refetch(), variant: 'secondary' }"
		/>
		<div v-else-if="task" class="min-h-0 flex-1 overflow-y-auto">
			<div class="border-border space-y-5 border-b p-5">
				<TaskParentLink v-if="task.parentId" :parent-id="task.parentId" :workspace-slug="workspaceSlug" />
				<TaskDescriptionEditor :task="task" :workspace-slug="workspaceSlug" />
				<TaskMetadataHorizontal :task="task" />
				<div v-if="task.tags?.length" class="flex flex-wrap gap-1.5">
					<TagChip v-for="tag in task.tags" :key="tag.id" :tag="tag" />
				</div>
			</div>
			<div v-if="!task.parentId" class="border-border border-b p-5"><TaskSubtasks :task="task" :workspace-slug="workspaceSlug" /></div>
			<div class="border-border border-b p-5"><TaskChecklist :task="task" :workspace-slug="workspaceSlug" /></div>
			<div class="border-border border-b p-5"><TaskAttachments :workspace-slug="workspaceSlug" :task-id="task.id" /></div>
			<div class="p-5"><TaskTimeline :workspace-slug="workspaceSlug" :task-id="task.id" /></div>
		</div>
	</aside>
</template>
