<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import { cn } from "@/lib/utils";
import type { Task } from "~/types";

defineProps<{ placeholder: string }>();

const selectedTasks = defineModel<Task[]>({ default: [] });
const flattendSelected = computed(() => selectedTasks.value.map((task) => task.id));

const { data: tasks } = useQuery({
	queryKey: ["workspace-tasks", useRoute().params.slug],
	queryFn: async () => {
		const { success, data: tasks } = await useApiFetch<{ success: boolean; data: Task[] }>(`/workspaces/${useRoute().params.slug}/tasks`);
		if (!tasks || !success) throw new Error("Failed to fetch workspace tasks");
		return tasks;
	},
});

const addOrRemoveTask = (task: Task) => {
	if (flattendSelected.value.includes(task.id)) {
		const index = selectedTasks.value.findIndex(({ id }) => id === task.id);
		selectedTasks.value.splice(index, 1);
		console.log("1 tasss: => ", task, selectedTasks, flattendSelected);
		return;
	}

	selectedTasks.value.push(task);
	console.log("2 tasss: => ", task, selectedTasks, flattendSelected);
};
</script>

<template>
	<div class="space-y-2">
		<Popover>
			<PopoverTrigger as-child>
				<Button variant="outline" role="combobox" aria-expanded="{open}" class="w-full justify-between">
					{{ flattendSelected.length > 0 ? `${flattendSelected.length} task${flattendSelected.length > 1 ? "s" : ""} selected` : placeholder }}
					<Icon name="lucide:chevrons-up-down" :size="16" class="ml-2 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent class="w-[400px] p-0">
				<Command>
					<CommandInput placeholder="Search tasks..." />
					<CommandList>
						<CommandEmpty>No tasks found.</CommandEmpty>
						<CommandGroup>
							<template v-if="tasks && tasks.length">
								<CommandItem v-for="task in tasks" :key="task.id" :value="task.title" class="flex items-center justify-between" @select="addOrRemoveTask(task)">
									<div class="flex items-center">
										<Icon name="lucide:check" :size="16" :class="cn('mr-2', flattendSelected.includes(task.id) ? 'opacity-100' : 'opacity-0')" />
										<span>{{ task.title }}</span>
									</div>
									<Badge variant="outline" :class="getPriorityColor(task.priority)"> {{ task.priority }} </Badge>
								</CommandItem>
							</template>
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>

		<div v-if="selectedTasks.length" class="flex flex-wrap gap-2 pt-2">
			<Badge v-for="task in selectedTasks" :key="task.id" variant="secondary" class="flex items-center gap-1">
				{{ task.title }}
				<button
					type="button"
					class="ring-offset-background focus:ring-ring ml-1 flex items-center justify-center rounded-full outline-none focus:ring-2 focus:ring-offset-2"
					@click="addOrRemoveTask(task)"
				>
					<Icon name="lucide:x" :size="12" />
					<span class="sr-only">Remove {{ task.title }}</span>
				</button>
			</Badge>
		</div>
	</div>
</template>
