<script lang="ts" setup>
import { TagChip } from "~/features/tags";
import { useTaskWorkbench } from "~/features/tasks/composables/useTaskWorkbench";
import SavedViewBar from "./SavedViewBar.vue";
import TaskEditorPanel from "./TaskEditorPanel.vue";
import TaskFilterBar from "./TaskFilterBar.vue";
import TaskInspector from "./TaskInspector.vue";

const {
	activeFilterCount,
	activeTaskId,
	clearFilters,
	closePanel,
	columns,
	downloadCsv,
	editor,
	error,
	filters,
	goToPage,
	handleSaved,
	isError,
	isExporting,
	isFetching,
	isFiltered,
	isPanelOpen,
	loadMoreInColumn,
	openPrintView,
	openTask,
	pageCount,
	rangeLabel,
	refetch,
	savedViews,
	searchInput,
	startCreating,
	startEditing,
	tasks,
	toggleInList,
	totalTasks,
	viewMode,
	workspaceName,
	workspaceSlug,
	writeQuery,
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
			<div class="flex items-center gap-2">
				<DropdownMenu>
					<DropdownMenuTrigger as-child>
						<Button variant="outline" size="icon" :disabled="isExporting" aria-label="More actions"><Icon name="lucide:more-horizontal" :size="16" /></Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem @select="downloadCsv"><Icon name="lucide:download" :size="15" /> Export CSV</DropdownMenuItem>
						<DropdownMenuItem @select="openPrintView"><Icon name="lucide:printer" :size="15" /> Print view</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
				<Button @click="startCreating"><Icon name="lucide:plus" :size="16" /> New task</Button>
			</div>
		</header>

		<div class="product-toolbar bg-surface-1/95 sticky top-16 z-20 !flex-col !items-stretch gap-3 backdrop-blur-xl">
			<div class="flex flex-wrap items-center gap-2">
				<div class="relative min-w-0 flex-1 sm:max-w-sm">
					<Icon name="lucide:search" :size="16" class="text-text-tertiary absolute start-3 top-1/2 -translate-y-1/2" />
					<Input v-model="searchInput" class="ps-9" placeholder="Search tasks…" aria-label="Search tasks" />
				</div>
				<SegmentedControl v-model="viewMode" :options="viewOptions" label="Task view" size="md" class="sm:ms-auto" />
			</div>

			<TaskFilterBar
				:workspace-slug="workspaceSlug"
				:filters="filters"
				:active-filter-count="activeFilterCount"
				:is-filtered="isFiltered"
				@toggle="(key, value) => toggleInList(key, value as never)"
				@write="(patch) => writeQuery(patch)"
				@clear="clearFilters"
			/>

			<SavedViewBar
				:views="savedViews.views.value"
				:active-view="savedViews.activeView.value"
				:is-filtered="isFiltered"
				@apply="savedViews.applyView"
				@save="savedViews.saveCurrentAs"
				@remove="savedViews.deleteView"
			/>
		</div>

		<p v-if="viewMode === 'board' && filters.status.length" class="text-text-secondary bg-surface-0 rounded-lg border px-4 py-3 text-sm">
			The board shows every status, so the status filter is not applied here. It still applies in list view.
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

				<!-- List -->
				<div v-else-if="viewMode === 'list' && tasks.length">
					<div class="text-text-tertiary grid grid-cols-[minmax(0,1fr)_120px_110px_120px] gap-4 border-b px-4 py-3 text-xs font-semibold uppercase max-md:hidden">
						<span>Task</span><span>Status</span><span>Priority</span><span>Due date</span>
					</div>
					<Pressable
						v-for="task in tasks"
						:key="task.id"
						class="product-row grid w-full grid-cols-[minmax(0,1fr)_120px_110px_120px] items-center gap-4 text-start max-md:grid-cols-[minmax(0,1fr)_auto]"
						@click="openTask(task.id)"
					>
						<div class="min-w-0">
							<p class="truncate text-sm font-medium">{{ task.title }}</p>
							<div class="mt-1 flex min-w-0 items-center gap-2">
								<p class="text-text-tertiary truncate text-xs tabular-nums">{{ task.id }} · {{ task.commentCount }} {{ task.commentCount === 1 ? "comment" : "comments" }}</p>
								<TagChip v-for="tag in (task.tags ?? []).slice(0, 3)" :key="tag.id" :tag="tag" />
							</div>
						</div>
						<BadgeStatus class="max-md:row-start-1" :status="task.status" /><BadgePriority class="max-md:hidden" :priority="task.priority" /><span
							class="text-text-secondary text-sm max-md:hidden"
							>{{ task.dueDate ? formatDate(task.dueDate, "MMM D") : "No date" }}</span
						>
					</Pressable>

					<div v-if="pageCount > 1" class="flex items-center justify-between gap-3 border-t px-4 py-3">
						<p class="text-text-tertiary text-xs tabular-nums">{{ rangeLabel }}</p>
						<div class="flex items-center gap-2">
							<Button variant="outline" size="sm" :disabled="filters.page <= 1" @click="goToPage(filters.page - 1)"> <Icon name="lucide:chevron-left" :size="14" /> Previous </Button>
							<span class="text-text-secondary text-xs tabular-nums">Page {{ filters.page }} of {{ pageCount }}</span>
							<Button variant="outline" size="sm" :disabled="filters.page >= pageCount" @click="goToPage(filters.page + 1)">
								Next <Icon name="lucide:chevron-right" :size="14" />
							</Button>
						</div>
					</div>
				</div>

				<!-- Board -->
				<div v-else-if="viewMode === 'board'" class="bg-canvas overflow-x-auto p-3">
					<p class="text-text-tertiary mb-2 text-xs md:hidden">Swipe horizontally to view every status column.</p>
					<div class="grid min-w-[820px] grid-cols-3 gap-3">
						<section v-for="column in columns" :key="column.status" class="bg-surface-0 min-h-[36rem] rounded-xl border">
							<header class="flex items-center justify-between border-b px-3 py-3">
								<BadgeStatus :status="column.status" /><span class="text-text-tertiary font-mono text-xs tabular-nums">{{ column.total }}</span>
							</header>
							<div class="space-y-2 p-2">
								<Pressable
									v-for="task in column.tasks"
									:key="task.id"
									class="border-border bg-surface-0 hover:border-text-tertiary w-full rounded-md border p-3 text-start"
									@click="openTask(task.id)"
								>
									<p class="text-sm leading-5 font-medium">{{ task.title }}</p>
									<div v-if="task.tags?.length" class="mt-2 flex flex-wrap gap-1">
										<TagChip v-for="tag in task.tags.slice(0, 3)" :key="tag.id" :tag="tag" />
									</div>
									<div class="mt-5 flex items-center justify-between gap-2">
										<BadgePriority :priority="task.priority" /><span class="text-text-tertiary text-xs">{{ task.dueDate ? formatDate(task.dueDate, "MMM D") : "No date" }}</span>
									</div>
								</Pressable>

								<Button v-if="column.hasMore" variant="secondary" class="w-full" @click="loadMoreInColumn(column.status)">
									Load more ({{ column.total - column.tasks.length }} left)
								</Button>
								<Button variant="ghost" class="w-full justify-start" @click="startCreating"><Icon name="lucide:plus" :size="15" /> Add task</Button>
							</div>
						</section>
					</div>
				</div>

				<AppEmptyState
					v-else
					:heading="isFiltered ? 'No matching tasks' : 'No tasks yet'"
					:body="isFiltered ? 'Clear your filters to see all workspace tasks.' : 'Create a task to start organizing work in this workspace.'"
					icon="lucide:check-square"
					:action="{ label: isFiltered ? 'Clear filters' : 'Create task', onClick: isFiltered ? clearFilters : startCreating, variant: 'secondary' }"
				/>
			</section>

			<TaskEditorPanel v-if="editor?.mode === 'create'" :workspace-slug="workspaceSlug" @close="closePanel" @saved="handleSaved" />
			<TaskEditorPanel v-else-if="editor?.mode === 'edit'" :workspace-slug="workspaceSlug" :task="editor.task" @close="closePanel" @saved="handleSaved" />
			<TaskInspector v-else-if="activeTaskId" :workspace-slug="workspaceSlug" :task-id="activeTaskId" @close="closePanel" @edit="startEditing" @deleted="closePanel" />
		</div>

		<p v-if="!isFetching && !isError && viewMode === 'list' && totalTasks > 0 && pageCount <= 1" class="text-text-tertiary px-1 text-xs tabular-nums">
			{{ totalTasks }} task{{ totalTasks === 1 ? "" : "s" }}
		</p>
	</div>
</template>
