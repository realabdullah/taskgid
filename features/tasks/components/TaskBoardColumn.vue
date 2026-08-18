<script lang="ts" setup>
import { VueDraggable } from "vue-draggable-plus";
import { TagChip } from "~/features/tags";
import ChecklistBadge from "./ChecklistBadge.vue";
import SubtaskBadge from "./SubtaskBadge.vue";
import { RecurrenceBadge } from "~/features/recurrence";
import type { Task } from "~/types";

const props = defineProps<{
	status: Task["status"];
	label: string;
	tasks: Task[];
	total: number;
	hasMore: boolean;
}>();

const emit = defineEmits<{
	open: [taskId: string];
	move: [payload: { task: Task; status: Task["status"] }];
	loadMore: [];
	create: [];
}>();

/*
 * The draggable list needs a local, writable copy: SortableJS mutates the array
 * it is given, and the query cache must not be mutated in place.
 */
const items = ref<Task[]>([...props.tasks]);
watch(
	() => props.tasks,
	(tasks) => {
		items.value = [...tasks];
	}
);

const onAdd = (event: { item: HTMLElement }) => {
	const taskId = event.item.dataset.taskId;
	const task = taskId ? items.value.find((item) => item.id === taskId) : undefined;
	if (task && task.status !== props.status) emit("move", { task, status: props.status });
};

/*
 * Dragging is not the only way to move a card. A focused card responds to
 * ⌘/Ctrl + ArrowLeft/Right, and every card carries an explicit status menu, so
 * the board is fully operable without a pointer.
 */
const STATUS_ORDER: Task["status"][] = ["todo", "in_progress", "done"];
const onCardKeydown = (event: KeyboardEvent, task: Task) => {
	if (!(event.metaKey || event.ctrlKey)) return;
	const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
	if (!direction) return;
	const next = STATUS_ORDER[STATUS_ORDER.indexOf(task.status) + direction];
	if (!next) return;
	event.preventDefault();
	emit("move", { task, status: next });
};

const statusLabels: Record<Task["status"], string> = { todo: "To do", in_progress: "In progress", done: "Done" };
</script>

<template>
	<section class="bg-surface-0 flex min-h-[36rem] flex-col rounded-xl border">
		<header class="flex items-center justify-between border-b px-3 py-3">
			<BadgeStatus :status="status" />
			<span class="text-text-tertiary font-mono text-xs tabular-nums">{{ total }}</span>
		</header>

		<VueDraggable v-model="items" :group="{ name: 'workspace-tasks' }" :animation="150" ghost-class="opacity-40" drag-class="rotate-1" class="min-h-24 flex-1 space-y-2 p-2" @add="onAdd">
			<div
				v-for="task in items"
				:key="task.id"
				:data-task-id="task.id"
				role="button"
				tabindex="0"
				class="border-border bg-surface-0 hover:border-text-tertiary focus-visible:ring-focus w-full cursor-grab rounded-md border p-3 text-start focus-visible:ring-2 focus-visible:outline-none active:cursor-grabbing"
				@click="emit('open', task.id)"
				@keydown.enter="emit('open', task.id)"
				@keydown.space.prevent="emit('open', task.id)"
				@keydown="onCardKeydown($event, task)"
			>
				<div class="flex items-start justify-between gap-2">
					<p class="min-w-0 text-sm leading-5 font-medium">{{ task.title }}</p>
					<DropdownMenu>
						<DropdownMenuTrigger as-child>
							<Button variant="ghost" size="icon" class="-me-1 -mt-1 size-6 shrink-0" :aria-label="`Change status of ${task.title}`" @click.stop>
								<Icon name="lucide:ellipsis" :size="14" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem v-for="option in STATUS_ORDER" :key="option" :disabled="option === task.status" @select="emit('move', { task, status: option })">
								Move to {{ statusLabels[option] }}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<div v-if="task.tags?.length" class="mt-2 flex flex-wrap gap-1">
					<TagChip v-for="tag in task.tags.slice(0, 3)" :key="tag.id" :tag="tag" />
				</div>

				<div class="mt-5 flex items-center justify-between gap-2">
					<div class="flex items-center gap-2">
						<BadgePriority :priority="task.priority" />
						<RecurrenceBadge :task="task" />
						<SubtaskBadge :task="task" />
						<ChecklistBadge :task="task" />
					</div>
					<span class="text-text-tertiary text-xs">{{ task.dueDate ? formatDate(task.dueDate, "MMM D") : "No date" }}</span>
				</div>
			</div>
		</VueDraggable>

		<div class="space-y-2 p-2 pt-0">
			<Button v-if="hasMore" variant="secondary" class="w-full" @click="emit('loadMore')">Load more ({{ total - tasks.length }} left)</Button>
			<Button variant="ghost" class="w-full justify-start" @click="emit('create')"><Icon name="lucide:plus" :size="15" /> Add task</Button>
		</div>
	</section>
</template>
