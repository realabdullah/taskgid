<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import { cn } from "@/lib/utils";
import type { Task } from "~/types";

defineProps<{ placeholder: string }>();

const selectedTasks = defineModel<Task[]>({ default: [] });
const flattendSelected = computed(() => selectedTasks.value.map((task) => task.id));

const {
	data: tasks,
	isPending: isTasksLoading,
	isError: isTasksError,
	error: tasksError,
	refetch: refetchTasks,
} = useQuery({
	queryKey: ["workspace-tasks", useRoute().params.slug],
	queryFn: async () => {
		const { data: tasks } = await fetchAllPages<Task>(API_ENDPOINTS.workspaces.tasks(String(useRoute().params.slug)));
		return tasks;
	},
});

const addOrRemoveTask = (task: Task) => {
	if (flattendSelected.value.includes(task.id)) {
		const index = selectedTasks.value.findIndex(({ id }) => id === task.id);
		selectedTasks.value.splice(index, 1);
		return;
	}

	selectedTasks.value.push(task);
};
</script>

<template>
	<div class="space-y-2">
		<Popover>
			<PopoverTrigger as-child>
				<Button
					variant="outline"
					role="combobox"
					class="h-12 w-full !justify-start !transition-none focus-visible:!ring-0 active:!scale-100"
					content-class="grid w-full grid-cols-[minmax(0,1fr)_1rem] gap-3"
				>
					<span class="min-w-0 truncate text-start tabular-nums">{{
						flattendSelected.length > 0 ? `${flattendSelected.length} task${flattendSelected.length === 1 ? "" : "s"} selected` : placeholder
					}}</span>
					<Icon name="lucide:chevron-down" :size="16" class="justify-self-end opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" :side-offset="8" class="w-[min(32rem,calc(100vw-2rem))] p-0">
				<Command class="border-0 shadow-none">
					<CommandInput placeholder="Search tasks…" />
					<CommandList>
						<div v-if="isTasksLoading" class="space-y-2 p-3">
							<Skeleton class="h-8 w-full" />
							<Skeleton class="h-8 w-full" />
						</div>

						<div v-else-if="isTasksError" class="p-3">
							<AppEmptyState
								heading="Unable to load tasks"
								:body="String(tasksError || 'Check your connection and try again.')"
								icon="lucide:alert-circle"
								:action="{ label: 'Retry', onClick: () => refetchTasks(), variant: 'secondary' }"
							/>
						</div>

						<template v-else>
							<CommandEmpty>No matching tasks.</CommandEmpty>
							<CommandGroup>
								<template v-if="tasks && tasks.length">
									<CommandItem
										v-for="task in tasks"
										:key="task.id"
										:value="task.title"
										class="grid h-auto min-h-16 grid-cols-[1rem_minmax(0,1fr)_auto] items-center gap-3 px-3 py-3"
										@select="addOrRemoveTask(task)"
									>
										<Icon
											name="lucide:check"
											:size="16"
											:class="
												cn(
													'transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]',
													flattendSelected.includes(task.id) ? 'text-primary blur-0 scale-100 opacity-100' : 'scale-[0.25] opacity-0 blur-[4px]'
												)
											"
										/>
										<div class="min-w-0">
											<p class="text-text-primary truncate text-sm font-semibold">{{ task.title }}</p>
											<p class="text-text-tertiary mt-1 truncate text-xs tabular-nums">
												{{ task.assignees.length ? `${task.assignees.length} assignee${task.assignees.length === 1 ? "" : "s"}` : "Unassigned" }}
											</p>
										</div>
										<span class="font-mono text-xs font-semibold tracking-[0.08em] uppercase" :class="getPriorityColor(task.priority)">{{ task.priority }}</span>
									</CommandItem>
								</template>
							</CommandGroup>
						</template>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>

		<div v-if="selectedTasks.length" class="flex flex-wrap gap-2 pt-2">
			<Badge v-for="task in selectedTasks" :key="task.id" variant="secondary" class="flex items-center gap-1">
				{{ task.title }}
				<Button type="button" variant="ghost" size="icon" static class="ms-1 h-5 w-5 rounded-full" @click="addOrRemoveTask(task)">
					<Icon name="lucide:x" :size="12" />
					<span class="sr-only">Remove {{ task.title }}</span>
				</Button>
			</Badge>
		</div>
	</div>
</template>
