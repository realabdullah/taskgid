<script lang="ts" setup>
import { TagChip, useWorkspaceTags } from "~/features/tags";
import type { Task } from "~/types";
import type { TaskFilters, TaskSortField } from "../composables/useTaskFilters";

const props = defineProps<{
	workspaceSlug: string;
	filters: TaskFilters;
	activeFilterCount: number;
	isFiltered: boolean;
}>();

const emit = defineEmits<{
	toggle: [key: "status" | "priority" | "tags", value: string];
	write: [patch: Partial<TaskFilters>];
	clear: [];
}>();

const { tags } = useWorkspaceTags(() => props.workspaceSlug);

const STATUS_OPTIONS: Array<{ value: Task["status"]; label: string }> = [
	{ value: "todo", label: "To do" },
	{ value: "in_progress", label: "In progress" },
	{ value: "done", label: "Done" },
];
const PRIORITY_OPTIONS: Array<{ value: Task["priority"]; label: string }> = [
	{ value: "high", label: "High" },
	{ value: "medium", label: "Medium" },
	{ value: "low", label: "Low" },
];
const ASSIGNEE_OPTIONS = [
	{ value: "", label: "Anyone" },
	{ value: "me", label: "Assigned to me" },
	{ value: "unassigned", label: "Unassigned" },
];
const SORT_OPTIONS: Array<{ value: TaskSortField; label: string }> = [
	{ value: "createdAt", label: "Created" },
	{ value: "dueDate", label: "Due date" },
	{ value: "priority", label: "Priority" },
	{ value: "title", label: "Title" },
	{ value: "updatedAt", label: "Updated" },
];

const summarise = (label: string, selected: string[], options: Array<{ value: string; label: string }>) => {
	if (selected.length === 0) return label;
	if (selected.length === 1) return options.find((option) => option.value === selected[0])?.label ?? label;
	return `${label} · ${selected.length}`;
};

const toggleSortOrder = () => emit("write", { sortOrder: props.filters.sortOrder === "ASC" ? "DESC" : "ASC" });
</script>

<template>
	<div class="flex flex-wrap items-center gap-2">
		<!-- Status -->
		<Popover>
			<PopoverTrigger as-child>
				<Button variant="outline" class="justify-between gap-2" :aria-label="`Filter by status, ${filters.status.length} selected`">
					{{ summarise("Status", filters.status, STATUS_OPTIONS) }}
					<Icon name="lucide:chevron-down" :size="14" class="opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" class="w-52 p-1">
				<label v-for="option in STATUS_OPTIONS" :key="option.value" class="hover:bg-surface-1 flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm">
					<Checkbox :model-value="filters.status.includes(option.value)" @update:model-value="emit('toggle', 'status', option.value)" />
					{{ option.label }}
				</label>
			</PopoverContent>
		</Popover>

		<!-- Priority -->
		<Popover>
			<PopoverTrigger as-child>
				<Button variant="outline" class="justify-between gap-2" :aria-label="`Filter by priority, ${filters.priority.length} selected`">
					{{ summarise("Priority", filters.priority, PRIORITY_OPTIONS) }}
					<Icon name="lucide:chevron-down" :size="14" class="opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" class="w-52 p-1">
				<label v-for="option in PRIORITY_OPTIONS" :key="option.value" class="hover:bg-surface-1 flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm">
					<Checkbox :model-value="filters.priority.includes(option.value)" @update:model-value="emit('toggle', 'priority', option.value)" />
					{{ option.label }}
				</label>
			</PopoverContent>
		</Popover>

		<!-- Tags -->
		<Popover v-if="tags.length">
			<PopoverTrigger as-child>
				<Button variant="outline" class="justify-between gap-2" :aria-label="`Filter by tag, ${filters.tags.length} selected`">
					{{ filters.tags.length ? `Tags · ${filters.tags.length}` : "Tags" }}
					<Icon name="lucide:chevron-down" :size="14" class="opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" class="max-h-72 w-56 overflow-y-auto p-1">
				<label v-for="tag in tags" :key="tag.id" class="hover:bg-surface-1 flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm">
					<Checkbox :model-value="filters.tags.includes(tag.name)" @update:model-value="emit('toggle', 'tags', tag.name)" />
					<TagChip :tag="tag" />
				</label>
			</PopoverContent>
		</Popover>

		<!-- Assignee -->
		<Select :model-value="filters.assignee" @update:model-value="(value: unknown) => emit('write', { assignee: String(value ?? '') })">
			<SelectTrigger class="w-[168px]" aria-label="Filter by assignee"><SelectValue /></SelectTrigger>
			<SelectContent>
				<SelectItem v-for="option in ASSIGNEE_OPTIONS" :key="option.value || 'any'" :value="option.value">{{ option.label }}</SelectItem>
			</SelectContent>
		</Select>

		<!-- Sort -->
		<div class="flex items-center">
			<Select :model-value="filters.sortBy" @update:model-value="(value: unknown) => emit('write', { sortBy: value as TaskSortField })">
				<SelectTrigger class="w-[152px] rounded-e-none" aria-label="Sort tasks by"><SelectValue /></SelectTrigger>
				<SelectContent>
					<SelectItem v-for="option in SORT_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</SelectItem>
				</SelectContent>
			</Select>
			<Button
				variant="outline"
				size="icon"
				class="rounded-s-none border-s-0"
				:aria-label="filters.sortOrder === 'ASC' ? 'Sorted ascending, switch to descending' : 'Sorted descending, switch to ascending'"
				@click="toggleSortOrder"
			>
				<Icon :name="filters.sortOrder === 'ASC' ? 'lucide:arrow-up-narrow-wide' : 'lucide:arrow-down-wide-narrow'" :size="15" />
			</Button>
		</div>

		<Button v-if="isFiltered" variant="ghost" class="gap-1.5" @click="emit('clear')">
			<Icon name="lucide:x" :size="14" /> Clear {{ activeFilterCount }} filter{{ activeFilterCount === 1 ? "" : "s" }}
		</Button>
	</div>
</template>
