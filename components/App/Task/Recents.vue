<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import type { Task, Pagination } from "~/types";

const { data: recentTasks } = useQuery({
	queryKey: ["workspace-recent-tasks", useRoute().params.slug],
	queryFn: async () => {
		const { success, data: tasks } = await useApiFetch<{ success: boolean; data: Task[]; pagination: Pagination }>(`/workspaces/${useRoute().params.slug}/tasks`);
		if (!tasks || !success) throw new Error("Failed to fetch workspace tasks");
		return tasks;
	},
});

const { deleteTask } = useTasks();

const isTaskModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const selectedTask = ref<Task>();

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
</script>

<template>
	<div class="space-y-4">
		<AppTaskCard v-for="task in recentTasks" :key="task.id" :task="task" @edit="setSelectedTask(task, 'update')" @delete="setSelectedTask(task, 'delete')" />

		<AppDeleteAction
			v-model="isDeleteModalOpen"
			title="Delete task?"
			description="Are you sure you want to delete this task? This action cannot be undone."
			@cancel="isDeleteModalOpen = false"
			@confirm="deleteTask(selectedTask?.id || '')"
		/>

		<AppTaskCreateOrEdit v-model="isTaskModalOpen" :task="selectedTask" @close="removeSelectedTask" />
	</div>
</template>
