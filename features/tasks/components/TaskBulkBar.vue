<script lang="ts" setup>
import { TagPicker } from "~/features/tags";
import { useWorkspaceStore } from "~/features/workspaces/stores";
import type { Task } from "~/types";

defineProps<{ count: number; workspaceSlug: string }>();

const emit = defineEmits<{
	status: [value: Task["status"]];
	priority: [value: Task["priority"]];
	dueDate: [value: string | null];
	assign: [assigneeId: string];
	tags: [names: string[]];
	remove: [];
	clear: [];
}>();

const { teams } = storeToRefs(useWorkspaceStore());
const dueDate = ref("");
const pendingTags = ref<string[]>([]);

const applyDueDate = () => emit("dueDate", dueDate.value ? new Date(`${dueDate.value}T12:00:00`).toISOString() : null);
const applyTags = () => {
	if (pendingTags.value.length) emit("tags", [...pendingTags.value]);
	pendingTags.value = [];
};
</script>

<template>
	<div
		class="border-border bg-surface-0 sticky bottom-4 z-30 mx-auto flex w-fit max-w-full flex-wrap items-center gap-2 rounded-full border px-3 py-2 shadow-lg"
		role="region"
		aria-label="Bulk actions"
	>
		<span class="text-text-secondary ps-1 text-sm font-medium tabular-nums">{{ count }} selected</span>
		<Separator orientation="vertical" class="h-5" />

		<Select @update:model-value="(value: unknown) => emit('status', value as Task['status'])">
			<SelectTrigger class="h-8 w-[124px] rounded-full" aria-label="Set status"><SelectValue placeholder="Status" /></SelectTrigger>
			<SelectContent> <SelectItem value="todo">To do</SelectItem><SelectItem value="in_progress">In progress</SelectItem><SelectItem value="done">Done</SelectItem> </SelectContent>
		</Select>

		<Select @update:model-value="(value: unknown) => emit('priority', value as Task['priority'])">
			<SelectTrigger class="h-8 w-[116px] rounded-full" aria-label="Set priority"><SelectValue placeholder="Priority" /></SelectTrigger>
			<SelectContent> <SelectItem value="high">High</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="low">Low</SelectItem> </SelectContent>
		</Select>

		<Select @update:model-value="(value: unknown) => emit('assign', String(value))">
			<SelectTrigger class="h-8 w-[132px] rounded-full" aria-label="Assign to"><SelectValue placeholder="Assign to" /></SelectTrigger>
			<SelectContent>
				<SelectItem v-for="member in teams ?? []" :key="member.id" :value="member.id">{{ member.firstName }} {{ member.lastName }}</SelectItem>
			</SelectContent>
		</Select>

		<Popover>
			<PopoverTrigger as-child>
				<Button variant="outline" size="sm" class="h-8 rounded-full">Due date</Button>
			</PopoverTrigger>
			<PopoverContent class="w-64 space-y-2">
				<label for="bulk-due-date" class="product-label">Set due date</label>
				<Input id="bulk-due-date" v-model="dueDate" type="date" />
				<div class="flex gap-2">
					<Button size="sm" class="flex-1" @click="applyDueDate">Apply</Button>
					<Button size="sm" variant="ghost" @click="emit('dueDate', null)">Clear date</Button>
				</div>
			</PopoverContent>
		</Popover>

		<Popover>
			<PopoverTrigger as-child>
				<Button variant="outline" size="sm" class="h-8 rounded-full">Add tags</Button>
			</PopoverTrigger>
			<PopoverContent class="w-72 space-y-2">
				<TagPicker v-model="pendingTags" :workspace-slug="workspaceSlug" placeholder="Choose tags…" />
				<Button size="sm" class="w-full" :disabled="!pendingTags.length" @click="applyTags">Add to {{ count }} task{{ count === 1 ? "" : "s" }}</Button>
			</PopoverContent>
		</Popover>

		<Separator orientation="vertical" class="h-5" />
		<Button variant="ghost" size="sm" class="h-8 rounded-full" @click="emit('remove')"><Icon name="lucide:trash-2" :size="14" /> Delete</Button>
		<Button variant="ghost" size="icon" class="size-8 rounded-full" aria-label="Clear selection" @click="emit('clear')"><Icon name="lucide:x" :size="14" /></Button>
	</div>
</template>
