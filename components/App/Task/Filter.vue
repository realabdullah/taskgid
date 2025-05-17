<script lang="ts" setup>
import { refDebounced } from "@vueuse/core";
import type { TaskFilter } from "~/types";

const src = defineModel<TaskFilter>({ default: {} });
const filter = refDebounced<TaskFilter>(src, 2000, { maxWait: 2000 });

const statuses = [
	{ id: "todo", label: "To Do" },
	{ id: "in_progress", label: "In Progress" },
	{ id: "done", label: "Completed" },
];

const priorities = [
	{ id: "low", label: "Low" },
	{ id: "medium", label: "Medium" },
	{ id: "high", label: "High" },
];

const assignees = [
	{ id: "me", label: "Assigned to me" },
	{ id: "unassigned", label: "Unassigned" },
];

const handleChange = (value: string, type: keyof typeof filter.value) => {
	const currentArray = filter.value[type] as string[];
	const index = currentArray.indexOf(value);

	if (index > -1) currentArray.splice(index, 1);
	else currentArray.push(value);
};

const resetFilters = () => {
	filter.value.search = "";
	filter.value.status = [];
	filter.value.priority = [];
	filter.value.assignee = [];
};
</script>

<template>
	<Card>
		<CardHeader>
			<CardTitle>Filters</CardTitle>
		</CardHeader>

		<CardContent class="space-y-6">
			<div class="space-y-2">
				<div class="relative">
					<Icon name="hugeicons:search-01" :size="16" class="text-muted-foreground absolute top-2.5 left-2" />
					<Input v-model="filter.search" placeholder="Search tasks..." class="pl-8" />
				</div>
			</div>

			<div class="space-y-4">
				<h3 class="text-sm font-medium">Status</h3>
				<div class="space-y-2">
					<div v-for="status in statuses" :key="status.id" class="flex items-center space-x-2">
						<Checkbox :id="status.id" :model-value="filter.status.includes(status.id)" @update:model-value="handleChange(status.id, 'status')" />
						<Label :for="status.id">{{ status.label }}</Label>
					</div>
				</div>
			</div>

			<div class="space-y-4">
				<h3 class="text-sm font-medium">Priority</h3>
				<div class="space-y-2">
					<div v-for="priority in priorities" :key="priority.id" class="flex items-center space-x-2">
						<Checkbox :id="priority.id" :model-value="filter.priority.includes(priority.id)" @update:model-value="handleChange(priority.id, 'priority')" />
						<Label :for="priority.id">{{ priority.label }}</Label>
					</div>
				</div>
			</div>

			<div class="space-y-4">
				<h3 class="text-sm font-medium">Assignee</h3>
				<div class="space-y-2">
					<div v-for="assignee in assignees" :key="assignee.id" class="flex items-center space-x-2">
						<Checkbox :id="assignee.id" :model-value="filter.assignee.includes(assignee.id)" @update:model-value="handleChange(assignee.id, 'assignee')" />
						<Label :for="assignee.id">{{ assignee.label }}</Label>
					</div>
				</div>
			</div>

			<Button variant="outline" class="w-full" @click="resetFilters">Reset Filters</Button>
		</CardContent>
	</Card>
</template>
