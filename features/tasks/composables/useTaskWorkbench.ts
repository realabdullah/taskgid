import { refDebounced } from "@vueuse/core";
import type { Task } from "~/types";
import { useWorkspaceStore } from "~/features/workspaces/stores";
import { useSavedViews } from "./useSavedViews";
import { useTaskBoard } from "./useTaskBoard";
import { useTaskExport } from "./useTaskExport";
import { useTaskFilters } from "./useTaskFilters";
import { useTaskMutations } from "./useTaskMutations";
import { useTaskSelection } from "./useTaskSelection";
import { useWorkspaceTasks, TASKS_PER_PAGE } from "./useWorkspaceTasks";

type EditorState = { mode: "create" } | { mode: "edit"; task: Task } | null;

export const useTaskWorkbench = () => {
	const route = useRoute();
	const router = useRouter();
	const workspaceSlug = computed(() => String(route.params.slug ?? ""));
	const activeTaskId = computed(() => (typeof route.query.taskId === "string" ? route.query.taskId : ""));
	const { workspace } = storeToRefs(useWorkspaceStore());
	const editor = ref<EditorState>(null);

	const { activeFilterCount, clearFilters, filters, isFiltered, toggleInList, writeQuery } = useTaskFilters();
	const viewMode = computed({
		get: () => filters.value.view,
		set: (view: "list" | "board") => void writeQuery({ view }, { resetPage: false }),
	});

	// The search box stays local so typing is not debounced through the URL;
	// only the settled value is written, which keeps history and refetches sane.
	const searchInput = ref(filters.value.search);
	const debouncedSearch = refDebounced(searchInput, 180);
	watch(debouncedSearch, (value) => {
		if (value !== filters.value.search) void writeQuery({ search: value });
	});
	watch(
		() => filters.value.search,
		(value) => {
			if (value !== searchInput.value) searchInput.value = value;
		}
	);

	const list = useWorkspaceTasks(workspaceSlug, filters);
	const board = useTaskBoard(
		workspaceSlug,
		filters,
		computed(() => filters.value.view === "board")
	);
	const savedViews = useSavedViews(workspaceSlug);
	const mutations = useTaskMutations(workspaceSlug);
	const selection = useTaskSelection(list.tasks);

	/** Announced to screen readers whenever a card moves, since the change is visual. */
	const boardAnnouncement = ref("");
	const statusLabels: Record<Task["status"], string> = { todo: "To do", in_progress: "In progress", done: "Done" };

	const moveTask = (task: Task, status: Task["status"]) => {
		if (task.status === status) return;
		mutations.updateTask.mutate({ taskId: task.id, patch: { status } });
		boardAnnouncement.value = `${task.title} moved to ${statusLabels[status]}.`;
	};

	const deleteTask = (task: Task) => mutations.deleteTaskWithUndo(task);

	const applyToSelection = (patch: Parameters<typeof mutations.bulkUpdate.mutate>[0]["patch"]) => {
		const taskIds = [...selection.selectedIds.value];
		if (!taskIds.length) return;
		mutations.bulkUpdate.mutate({ taskIds, patch });
		selection.clear();
	};

	const assignSelection = (assigneeId: string) => {
		const taskIds = [...selection.selectedIds.value];
		if (!taskIds.length) return;
		mutations.bulkAssign.mutate({ taskIds, assigneeId });
		selection.clear();
	};

	/** Bulk tagging adds to what a task already has rather than replacing it. */
	const addTagsToSelection = (names: string[]) => {
		const tasks = selection.selectedTasks.value;
		if (!tasks.length) return;
		for (const task of tasks) {
			const merged = [...new Set([...(task.tags ?? []).map((tag) => tag.name), ...names])];
			mutations.updateTask.mutate({ taskId: task.id, patch: { tags: merged } });
		}
		selection.clear();
	};

	const deleteSelection = () => {
		const tasks = selection.selectedTasks.value;
		if (!tasks.length) return;
		mutations.bulkDeleteWithUndo(tasks);
		selection.clear();
	};
	const { downloadCsv, isExporting, openPrintView } = useTaskExport(workspaceSlug, filters);

	const isBoard = computed(() => filters.value.view === "board");
	const isFetching = computed(() => (isBoard.value ? board.isBoardLoading.value : list.isFetching.value));
	const isError = computed(() => (isBoard.value ? board.isBoardError.value : list.isError.value));
	const error = computed(() => (isBoard.value ? board.boardError.value : list.error.value));
	const refetch = () => (isBoard.value ? board.refetchBoard() : list.refetch());

	const pageCount = computed(() => list.pagination.value?.totalPages ?? 1);
	const totalTasks = computed(() => list.pagination.value?.total ?? 0);
	const rangeLabel = computed(() => {
		const total = totalTasks.value;
		if (!total) return "";
		const first = (filters.value.page - 1) * TASKS_PER_PAGE + 1;
		return `${first}–${Math.min(first + list.tasks.value.length - 1, total)} of ${total}`;
	});
	const goToPage = (page: number) => writeQuery({ page: Math.min(Math.max(1, page), pageCount.value) }, { resetPage: false });

	const workspaceName = computed(() => workspace.value?.title || workspaceSlug.value);
	const isPanelOpen = computed(() => Boolean(editor.value || activeTaskId.value));

	const openTask = async (taskId: string) => {
		editor.value = null;
		await router.replace({ query: { ...route.query, taskId } });
	};
	const closePanel = async () => {
		editor.value = null;
		if (!activeTaskId.value) return;
		const query = { ...route.query };
		delete query.taskId;
		await router.replace({ query });
	};
	const startCreating = () => {
		void closePanel();
		editor.value = { mode: "create" };
	};
	const startEditing = (task: Task) => {
		editor.value = { mode: "edit", task };
	};
	const handleSaved = async (task: Task) => {
		editor.value = null;
		await openTask(task.id);
	};
	const resetFilters = () => {
		searchInput.value = "";
		return clearFilters();
	};

	const onNewTaskIntent = () => startCreating();
	onMounted(() => {
		globalThis.window.addEventListener("taskgid:new-task-intent", onNewTaskIntent);
		if (route.query.create === "task") {
			startCreating();
			const query = { ...route.query };
			delete query.create;
			void router.replace({ query });
		}
	});
	onBeforeUnmount(() => globalThis.window.removeEventListener("taskgid:new-task-intent", onNewTaskIntent));

	return {
		activeFilterCount,
		activeTaskId,
		addTagsToSelection,
		applyToSelection,
		assignSelection,
		boardAnnouncement,
		deleteSelection,
		deleteTask,
		moveTask,
		selection,
		clearFilters: resetFilters,
		closePanel,
		columns: board.columns,
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
		loadMoreInColumn: board.loadMore,
		openPrintView,
		openTask,
		pageCount,
		rangeLabel,
		refetch,
		savedViews,
		searchInput,
		startCreating,
		startEditing,
		tasks: list.tasks,
		toggleInList,
		totalTasks,
		viewMode,
		workspaceName,
		workspaceSlug,
		writeQuery,
	};
};
