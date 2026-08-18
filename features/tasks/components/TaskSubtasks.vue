<script lang="ts" setup>
import { AvatarGroup } from "~/components/ui/avatar";
import type { Task } from "~/types";
import { MAX_SUBTASKS, useTaskSubtasks } from "../composables/useTaskSubtasks";
import { useTaskMutations } from "../composables/useTaskMutations";

const props = defineProps<{ task: Task; workspaceSlug: string }>();

const { subtasks, done, total, isFull, isFetching, isError, addSubtask, detachSubtask } = useTaskSubtasks(
	() => props.workspaceSlug,
	() => props.task.id
);
const { updateTask } = useTaskMutations(() => props.workspaceSlug);

const draft = ref("");
const percent = computed(() => (total.value ? Math.round((done.value / total.value) * 100) : 0));

const add = () => {
	const title = draft.value.trim();
	if (!title || isFull.value) return;
	addSubtask.mutate(title);
	draft.value = "";
};

/*
 * Ticking a subtask completes that subtask and nothing else. The parent's own
 * status is left alone on purpose: a parent that flipped to done because its
 * children did would be deciding something nobody asked it to decide.
 */
const toggle = (subtask: Task) => updateTask.mutate({ taskId: subtask.id, patch: { status: subtask.status === "done" ? "todo" : "done" } });

const subtaskUrl = (subtask: Task) => `/app/workspaces/${props.workspaceSlug}/tasks?taskId=${subtask.id}`;
</script>

<template>
	<section v-if="!task.parentId" class="space-y-3">
		<div class="flex items-baseline justify-between gap-3">
			<h3 class="text-text-primary text-sm font-bold">
				Subtasks
				<span v-if="total" class="text-text-tertiary ms-1 font-mono text-xs tabular-nums">{{ done }}/{{ total }}</span>
			</h3>
			<span v-if="total" class="text-text-tertiary font-mono text-xs tabular-nums">{{ percent }}%</span>
		</div>

		<div
			v-if="total"
			class="bg-surface-2 h-1 w-full overflow-hidden rounded-full"
			role="progressbar"
			:aria-valuenow="done"
			:aria-valuemin="0"
			:aria-valuemax="total"
			:aria-label="`${done} of ${total} subtasks done`"
		>
			<div class="bg-success h-full rounded-full transition-[width] duration-300" :style="{ width: `${percent}%` }" />
		</div>

		<p v-if="isError" class="text-danger text-xs">Unable to load subtasks.</p>
		<Skeleton v-else-if="isFetching && !total" class="h-8 w-full" />

		<ul v-if="total" class="space-y-1">
			<li v-for="subtask in subtasks" :key="subtask.id" class="group flex items-start gap-2.5">
				<Checkbox :model-value="subtask.status === 'done'" class="mt-0.5 shrink-0" :aria-label="subtask.title" @update:model-value="toggle(subtask)" />

				<NuxtLink :to="subtaskUrl(subtask)" class="focus-ring min-w-0 flex-1 text-sm leading-6" :class="subtask.status === 'done' ? 'text-text-tertiary line-through' : 'text-text-secondary'">
					<span class="truncate">{{ subtask.title }}</span>
					<span v-if="subtask.dueDate" class="text-text-tertiary ms-2 text-xs">{{ getTimeAgo(new Date(subtask.dueDate)) }}</span>
				</NuxtLink>

				<div class="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
					<AvatarGroup v-if="subtask.assignees?.length" :users="subtask.assignees" :max-displayed="2" size="sm" />
					<Button variant="ghost" size="icon" class="size-6" :aria-label="`Move ${subtask.title} to the top level`" title="Move to the top level" @click="detachSubtask.mutate(subtask.id)">
						<Icon name="lucide:corner-left-up" :size="13" />
					</Button>
				</div>
			</li>
		</ul>

		<div class="flex items-center gap-2">
			<Input
				v-model="draft"
				class="h-8 flex-1 text-sm"
				:placeholder="isFull ? `Limit of ${MAX_SUBTASKS} subtasks reached` : 'Add a subtask…'"
				:disabled="isFull"
				aria-label="New subtask"
				@keydown.enter.prevent="add"
			/>
			<Button size="sm" variant="secondary" :disabled="!draft.trim() || isFull || addSubtask.isPending.value" @click="add">Add</Button>
		</div>

		<p class="text-text-tertiary text-xs">Subtasks are their own tasks — they keep an assignee and a due date, and completing them all does not complete this one.</p>
	</section>
</template>
