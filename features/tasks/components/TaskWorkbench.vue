<script lang="ts" setup>
import { useTaskWorkbench } from "~/features/tasks/composables/useTaskWorkbench";
import TaskEditorPanel from "./TaskEditorPanel.vue";
import TaskInspector from "./TaskInspector.vue";

const {
	activeTaskId,
	clearFilters,
	closePanel,
	columns,
	editor,
	error,
	filteredTasks,
	handleSaved,
	isError,
	isFetching,
	isPanelOpen,
	isTaskListTruncated,
	openTask,
	priorityFilter,
	refetch,
	searchInput,
	startCreating,
	startEditing,
	statusFilter,
	tasks,
	totalTasks,
	viewMode,
	workspaceName,
	workspaceSlug,
} = useTaskWorkbench();

const viewOptions: Array<{ label: string; value: "list" | "board"; icon: string }> = [
	{ label: "List", value: "list", icon: "lucide:list" },
	{ label: "Board", value: "board", icon: "lucide:columns-3" },
];
</script>

<template>
	<div class="product-page">
		<header class="product-header">
			<div>
				<p class="product-eyebrow">{{ workspaceName }} / Tasks</p>
				<h1 class="product-title">Your team’s work, in one place.</h1>
				<p class="product-description">Plan, prioritize, discuss, and complete work without leaving this view.</p>
			</div>
			<Button @click="startCreating"><Icon name="lucide:plus" :size="16" /> New task</Button>
		</header>

		<div class="product-toolbar bg-surface-1/95 sticky top-16 z-20 backdrop-blur-xl">
			<div class="relative min-w-0 flex-1 sm:max-w-sm">
				<Icon name="lucide:search" :size="16" class="text-text-tertiary absolute start-3 top-1/2 -translate-y-1/2" />
				<Input v-model="searchInput" class="ps-9" placeholder="Search tasks…" aria-label="Search tasks" />
			</div>
			<Select v-model="statusFilter"
				><SelectTrigger class="w-full sm:w-[148px]"><SelectValue /></SelectTrigger
				><SelectContent
					><SelectItem value="all">All statuses</SelectItem><SelectItem value="todo">To do</SelectItem><SelectItem value="in_progress">In progress</SelectItem
					><SelectItem value="done">Done</SelectItem></SelectContent
				></Select
			>
			<Select v-model="priorityFilter"
				><SelectTrigger class="w-full sm:w-[140px]"><SelectValue /></SelectTrigger
				><SelectContent
					><SelectItem value="all">All priorities</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="medium">Medium</SelectItem
					><SelectItem value="low">Low</SelectItem></SelectContent
				></Select
			>
			<SegmentedControl v-model="viewMode" :options="viewOptions" label="Task view" size="md" class="sm:ms-auto" />
		</div>

		<p v-if="isTaskListTruncated" class="text-text-secondary bg-surface-0 rounded-lg border px-4 py-3 text-sm">
			Showing the first {{ tasks.length }} of {{ totalTasks }} tasks. Narrow the workspace down to see the rest.
		</p>

		<div class="grid min-h-[calc(100dvh-14rem)] gap-6" :class="isPanelOpen ? 'xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.72fr)]' : 'grid-cols-1'">
			<section class="product-panel min-w-0 overflow-hidden" :class="isPanelOpen ? 'hidden xl:block' : ''">
				<div v-if="isFetching" class="space-y-2 p-4"><Skeleton v-for="index in 7" :key="index" class="h-14 w-full" /></div>
				<AppEmptyState
					v-else-if="isError"
					heading="Unable to load tasks"
					:body="String(error || 'Check your connection and try again.')"
					icon="lucide:alert-circle"
					:action="{ label: 'Retry', onClick: () => refetch(), variant: 'secondary' }"
				/>
				<div v-else-if="filteredTasks.length && viewMode === 'list'">
					<div class="text-text-tertiary grid grid-cols-[minmax(0,1fr)_120px_110px_120px] gap-4 border-b px-4 py-3 text-xs font-semibold uppercase max-md:hidden">
						<span>Task</span><span>Status</span><span>Priority</span><span>Due date</span>
					</div>
					<Pressable
						v-for="task in filteredTasks"
						:key="task.id"
						class="product-row grid w-full grid-cols-[minmax(0,1fr)_120px_110px_120px] items-center gap-4 text-start max-md:grid-cols-[minmax(0,1fr)_auto]"
						@click="openTask(task.id)"
					>
						<div class="min-w-0">
							<p class="truncate text-sm font-medium">{{ task.title }}</p>
							<p class="text-text-tertiary mt-1 truncate text-xs tabular-nums">{{ task.id }} · {{ task.commentCount }} {{ task.commentCount === 1 ? "comment" : "comments" }}</p>
						</div>
						<BadgeStatus class="max-md:row-start-1" :status="task.status" /><BadgePriority class="max-md:hidden" :priority="task.priority" /><span
							class="text-text-secondary text-sm max-md:hidden"
							>{{ task.dueDate ? formatDate(task.dueDate, "MMM D") : "No date" }}</span
						>
					</Pressable>
				</div>
				<div v-else-if="filteredTasks.length" class="bg-canvas overflow-x-auto p-3">
					<p class="text-text-tertiary mb-2 text-xs md:hidden">Swipe horizontally to view every status column.</p>
					<div class="grid min-w-[820px] grid-cols-3 gap-3">
						<section v-for="column in columns" :key="column.status" class="bg-surface-0 min-h-[36rem] rounded-xl border">
							<header class="flex items-center justify-between border-b px-3 py-3">
								<BadgeStatus :status="column.status" /><span class="text-text-tertiary font-mono text-xs tabular-nums">{{ column.tasks.length }}</span>
							</header>
							<div class="space-y-2 p-2">
								<Pressable
									v-for="task in column.tasks"
									:key="task.id"
									class="border-border bg-surface-0 hover:border-text-tertiary w-full rounded-md border p-3 text-start"
									@click="openTask(task.id)"
								>
									<p class="text-sm leading-5 font-medium">{{ task.title }}</p>
									<div class="mt-5 flex items-center justify-between gap-2">
										<BadgePriority :priority="task.priority" /><span class="text-text-tertiary text-xs">{{ task.dueDate ? formatDate(task.dueDate, "MMM D") : "No date" }}</span>
									</div>
								</Pressable>
								<Button variant="ghost" class="w-full justify-start" @click="startCreating"><Icon name="lucide:plus" :size="15" /> Add task</Button>
							</div>
						</section>
					</div>
				</div>
				<AppEmptyState
					v-else
					:heading="tasks?.length ? 'No matching tasks' : 'No tasks yet'"
					:body="tasks?.length ? 'Clear your filters to see all workspace tasks.' : 'Create a task to start organizing work in this workspace.'"
					icon="lucide:check-square"
					:action="{ label: tasks?.length ? 'Clear filters' : 'Create task', onClick: tasks?.length ? clearFilters : startCreating, variant: 'secondary' }"
				/>
			</section>

			<TaskEditorPanel v-if="editor?.mode === 'create'" :workspace-slug="workspaceSlug" @close="closePanel" @saved="handleSaved" />
			<TaskEditorPanel v-else-if="editor?.mode === 'edit'" :workspace-slug="workspaceSlug" :task="editor.task" @close="closePanel" @saved="handleSaved" />
			<TaskInspector v-else-if="activeTaskId" :workspace-slug="workspaceSlug" :task-id="activeTaskId" @close="closePanel" @edit="startEditing" @deleted="closePanel" />
		</div>
	</div>
</template>
