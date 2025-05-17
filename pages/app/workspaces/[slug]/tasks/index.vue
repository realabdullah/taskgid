<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import type { Task, TaskFilter } from "~/types";

definePageMeta({
	name: "tasks",
	layout: "workspace",
});

const isTaskModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const selectedTask = ref<Task>();
const filter = reactive<TaskFilter>({
	search: "",
	status: [],
	priority: [],
	assignee: [],
});

const isFilterActive = computed(() => Object.entries(filter).some(([key, val]) => (key === "search" ? !!val : Array.isArray(val) && val.length > 0)));
const emptyStateCopy = computed(() => {
	if (isFilterActive.value) {
		return {
			title: "No matching tasks",
			description: "Try adjusting your filters or clearing them to see more tasks.",
			action: "Clear Filters",
		};
	} else {
		return {
			title: "No tasks yet",
			description: "Create your first task to start organizing work and moving things forward.",
			action: "Create Task",
		};
	}
});

const { deleteTask } = useTasks();
const { data: tasks } = useQuery({
	queryKey: ["workspace-tasks", useRoute().params.slug, filter],
	queryFn: async () => {
		const { success, data: tasks } = await useApiFetch<{ success: boolean; data: Task[] }>(`/workspaces/${useRoute().params.slug}/tasks`, {
			query: filter,
		});
		if (!tasks || !success) throw new Error("Failed to fetch workspace tasks");
		return tasks;
	},
});

const setSelectedTask = (task: Task, action: "update" | "delete") => {
	selectedTask.value = task;
	if (action === "delete") isDeleteModalOpen.value = true;
	else if (action === "update") isTaskModalOpen.value = true;
};

const removeSelectedTask = () => {
	isTaskModalOpen.value = false;
	isDeleteModalOpen.value = false;
	selectedTask.value = undefined;
};

const emptyStateAction = () => {
	if (isFilterActive.value) {
		filter.search = "";
		filter.status = [];
		filter.priority = [];
		filter.assignee = [];
		return;
	}

	isTaskModalOpen.value = true;
};
</script>

<template>
	<div class="space-y-6">
		<div class="flex flex-col justify-between gap-4 md:flex-row">
			<div>
				<h1 class="text-3xl font-bold tracking-tight">Tasks</h1>
				<p class="text-muted-foreground">Manage and organize tasks in your workspace</p>
			</div>

			<AppTaskCreateOrEdit v-model="isTaskModalOpen" :is-creating="!selectedTask" :task="selectedTask" @close="removeSelectedTask" />
		</div>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-4">
			<div class="md:col-span-1">
				<AppTaskFilter v-model="filter" />
			</div>

			<div class="md:col-span-3">
				<div v-if="tasks && tasks.length" class="space-y-4">
					<AppTaskCard v-for="task in tasks" :key="task.id" :task="task" @edit="setSelectedTask(task, 'update')" @delete="setSelectedTask(task, 'delete')" />

					<AppDeleteAction
						v-model="isDeleteModalOpen"
						title="Delete task?"
						description="Are you sure you want to delete this task? This action cannot be undone."
						@cancel="isDeleteModalOpen = false"
						@confirm="deleteTask(selectedTask?.id || '', removeSelectedTask)"
					/>
				</div>

				<AppEmptyState v-else :title="emptyStateCopy.title" :description="emptyStateCopy.description" :action="emptyStateCopy.action" @create="emptyStateAction" />
			</div>
		</div>
	</div>
</template>
