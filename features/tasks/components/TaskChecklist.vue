<script lang="ts" setup>
import type { ChecklistItem, Task } from "~/types";
import { useTaskMutations } from "../composables/useTaskMutations";

const props = defineProps<{ task: Task; workspaceSlug: string }>();

const { updateTask } = useTaskMutations(() => props.workspaceSlug);

/*
 * The whole list is sent on every change, which is what the API expects. Local
 * state mirrors the task so an edit in progress is not clobbered by a refetch,
 * and resyncs whenever the server's copy changes.
 */
const items = ref<ChecklistItem[]>([...(props.task.checklist ?? [])]);
watch(
	() => props.task.checklist,
	(next) => {
		items.value = [...(next ?? [])];
	},
	{ deep: true }
);

const draft = ref("");
const editingId = ref("");
const MAX_ITEMS = 100;

const done = computed(() => items.value.filter((item) => item.done).length);
const total = computed(() => items.value.length);
const percent = computed(() => (total.value ? Math.round((done.value / total.value) * 100) : 0));
const isFull = computed(() => total.value >= MAX_ITEMS);

const save = (next: ChecklistItem[]) => {
	items.value = next;
	updateTask.mutate({ taskId: props.task.id, patch: { checklist: next } });
};

const addItem = () => {
	const text = draft.value.trim();
	if (!text || isFull.value) return;
	// The server mints the id; an empty one here marks the item as new.
	save([...items.value, { id: "", text, done: false }]);
	draft.value = "";
};

const toggle = (item: ChecklistItem) => save(items.value.map((entry) => (entry.id === item.id ? { ...entry, done: !entry.done } : entry)));
const remove = (item: ChecklistItem) => save(items.value.filter((entry) => entry.id !== item.id));

const commitEdit = (item: ChecklistItem, text: string) => {
	editingId.value = "";
	const trimmed = text.trim();
	// An emptied item is a deletion — the API rejects blank text either way.
	if (!trimmed) return remove(item);
	if (trimmed === item.text) return;
	save(items.value.map((entry) => (entry.id === item.id ? { ...entry, text: trimmed } : entry)));
};

const move = (item: ChecklistItem, direction: -1 | 1) => {
	const index = items.value.findIndex((entry) => entry.id === item.id);
	const target = index + direction;
	if (index === -1 || target < 0 || target >= items.value.length) return;
	const next = [...items.value];
	[next[index], next[target]] = [next[target], next[index]];
	save(next);
};
</script>

<template>
	<section class="space-y-3">
		<div class="flex items-baseline justify-between gap-3">
			<h3 class="text-text-primary text-sm font-bold">
				Checklist
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
			:aria-label="`${done} of ${total} checklist items complete`"
		>
			<div class="bg-success h-full rounded-full transition-[width] duration-300" :style="{ width: `${percent}%` }" />
		</div>

		<ul v-if="total" class="space-y-1">
			<li v-for="(item, index) in items" :key="item.id || index" class="group flex items-start gap-2.5">
				<Checkbox :model-value="item.done" class="mt-0.5 shrink-0" :aria-label="item.text" @update:model-value="toggle(item)" />

				<Input
					v-if="editingId === item.id"
					:model-value="item.text"
					class="h-7 flex-1 py-0 text-sm"
					autofocus
					:aria-label="`Edit ${item.text}`"
					@blur="(event: FocusEvent) => commitEdit(item, (event.target as HTMLInputElement).value)"
					@keydown.enter.prevent="(event: KeyboardEvent) => (event.target as HTMLInputElement).blur()"
					@keydown.esc="editingId = ''"
				/>
				<Pressable v-else class="min-w-0 flex-1 text-start text-sm leading-6" :class="item.done ? 'text-text-tertiary line-through' : 'text-text-secondary'" @click="editingId = item.id">
					{{ item.text }}
				</Pressable>

				<div class="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
					<Button variant="ghost" size="icon" class="size-6" :disabled="index === 0" :aria-label="`Move ${item.text} up`" @click="move(item, -1)">
						<Icon name="lucide:chevron-up" :size="13" />
					</Button>
					<Button variant="ghost" size="icon" class="size-6" :disabled="index === items.length - 1" :aria-label="`Move ${item.text} down`" @click="move(item, 1)">
						<Icon name="lucide:chevron-down" :size="13" />
					</Button>
					<Button variant="ghost" size="icon" class="size-6" :aria-label="`Remove ${item.text}`" @click="remove(item)">
						<Icon name="lucide:x" :size="13" />
					</Button>
				</div>
			</li>
		</ul>

		<div class="flex items-center gap-2">
			<Input
				v-model="draft"
				class="h-8 flex-1 text-sm"
				:placeholder="isFull ? `Limit of ${MAX_ITEMS} items reached` : 'Add an item…'"
				:disabled="isFull"
				aria-label="New checklist item"
				@keydown.enter.prevent="addItem"
			/>
			<Button size="sm" variant="secondary" :disabled="!draft.trim() || isFull" @click="addItem">Add</Button>
		</div>

		<p class="text-text-tertiary text-xs">Checklist items are steps inside this task — a line of text and a tick, with no assignee, due date or page of their own.</p>
	</section>
</template>
