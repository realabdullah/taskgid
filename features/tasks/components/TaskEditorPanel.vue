<script lang="ts" setup>
import TaskRichTextEditor from "@/components/ui/tiptap/TipTapEditor.vue";
import type { Task } from "~/types";
import { useTaskEditor } from "~/features/tasks/composables/useTaskEditor";
import { TagPicker } from "~/features/tags";
import TaskAssigneePicker from "./TaskAssigneePicker.vue";

const props = defineProps<{ workspaceSlug: string; task?: Task }>();
const emit = defineEmits<{ close: []; saved: [task: Task] }>();

const { canSave, draft, dueDatePresets, isSubmitting, saveTask, setDueDate, teams, titleError } = useTaskEditor({
	get workspaceSlug() {
		return props.workspaceSlug;
	},
	get task() {
		return props.task;
	},
	onSaved: (task) => emit("saved", task),
});

/*
 * The form is one flow — write, then classify — rather than a stack of equal-weight
 * fields. Title and description own the top of the panel at their natural reading
 * size; everything else is a compact property row underneath.
 */
const statusOptions = [
	{ value: "todo", label: "To do" },
	{ value: "in_progress", label: "In progress" },
	{ value: "done", label: "Done" },
];

const priorityOptions = [
	{ value: "low", label: "Low" },
	{ value: "medium", label: "Medium" },
	{ value: "high", label: "High" },
];

const submitLabel = computed(() => (props.task ? "Save changes" : "Create task"));

// ⌘/Ctrl + Enter saves from anywhere in the panel, including inside the editor.
const onSubmitShortcut = (event: KeyboardEvent) => {
	if (!(event.metaKey || event.ctrlKey)) return;
	event.preventDefault();
	saveTask();
};
</script>

<template>
	<aside class="product-panel flex min-h-0 flex-col overflow-hidden" @keydown.enter="onSubmitShortcut" @keydown.esc="emit('close')">
		<header class="border-border flex items-start justify-between gap-4 border-b px-5 py-4">
			<div>
				<p class="product-eyebrow">{{ task ? `Task ${task.id}` : "New task" }}</p>
				<h2 class="mt-1 text-lg font-semibold tracking-[-0.025em]">{{ task ? "Edit task" : "Create task" }}</h2>
			</div>
			<Button type="button" variant="ghost" size="icon" aria-label="Close editor" @click="emit('close')">
				<Icon name="lucide:x" :size="17" />
			</Button>
		</header>

		<form class="min-h-0 flex-1 overflow-y-auto" @submit.prevent="saveTask">
			<!--
				Both fields carry a visible label and a bordered box. An earlier pass styled
				the title as borderless heading text, which read as a static title rather
				than something you could type into.
			-->
			<div class="space-y-4 px-5 py-5">
				<div class="space-y-1.5">
					<label for="task-title" class="product-label">Title</label>
					<Input id="task-title" v-model="draft.title" autofocus placeholder="What needs to happen?" class="h-11 text-base font-medium" />
				</div>

				<div class="space-y-1.5">
					<!-- A plain <p>, not a <label>: the editor's root is a div, so `for` would point at nothing clickable. -->
					<p class="product-label">Description</p>
					<TaskRichTextEditor v-model="draft.description" placeholder="Add context, links, or acceptance criteria…" />
				</div>
			</div>

			<!-- Classify -->
			<div class="border-border space-y-4 border-t px-5 py-5">
				<p class="product-label">Details</p>

				<div class="grid grid-cols-[92px_minmax(0,1fr)] items-center gap-x-3 gap-y-3">
					<label for="task-status" class="text-text-secondary text-sm">Status</label>
					<Select v-model="draft.status">
						<SelectTrigger id="task-status" class="w-full"><SelectValue /></SelectTrigger>
						<SelectContent>
							<SelectItem v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</SelectItem>
						</SelectContent>
					</Select>

					<label for="task-priority" class="text-text-secondary text-sm">Priority</label>
					<Select v-model="draft.priority">
						<SelectTrigger id="task-priority" class="w-full"><SelectValue /></SelectTrigger>
						<SelectContent>
							<SelectItem v-for="option in priorityOptions" :key="option.value" :value="option.value">{{ option.label }}</SelectItem>
						</SelectContent>
					</Select>

					<label for="task-due-date" class="text-text-secondary self-start pt-2 text-sm">Due</label>
					<div class="space-y-2">
						<Input id="task-due-date" v-model="draft.dueDate" type="date" />
						<div class="flex flex-wrap gap-1.5">
							<Pressable
								v-for="preset in dueDatePresets"
								:key="preset.label"
								static
								class="border-border rounded-full border px-2.5 py-1 text-xs font-medium"
								:class="draft.dueDate === preset.value ? 'bg-primary text-primary-foreground border-transparent' : 'text-text-secondary hover:bg-surface-2'"
								@click="setDueDate(preset.value)"
							>
								{{ preset.label }}
							</Pressable>
						</div>
					</div>

					<span class="text-text-secondary self-start pt-2 text-sm">People</span>
					<TaskAssigneePicker v-model="draft.assignees" :members="teams ?? []" :loading="!teams" />

					<span class="text-text-secondary self-start pt-2 text-sm">Tags</span>
					<TagPicker v-model="draft.tags" :workspace-slug="workspaceSlug" />
				</div>
			</div>
		</form>

		<footer class="border-border bg-surface-1 flex items-center justify-between gap-3 border-t px-5 py-3">
			<p class="text-text-tertiary min-w-0 truncate text-xs">
				<span v-if="titleError">{{ titleError }}</span>
				<span v-else>Press <kbd class="font-mono">⌘</kbd> + <kbd class="font-mono">Enter</kbd> to save</span>
			</p>
			<div class="flex shrink-0 items-center gap-2">
				<Button type="button" variant="ghost" :disabled="isSubmitting" @click="emit('close')">Cancel</Button>
				<Button type="button" :disabled="!canSave" :loading="isSubmitting" :loading-label="task ? 'Saving' : 'Creating'" min-width="8.5rem" @click="saveTask">
					{{ submitLabel }}
				</Button>
			</div>
		</footer>
	</aside>
</template>
