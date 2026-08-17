import { useQuery } from "@tanstack/vue-query";
import { refDebounced } from "@vueuse/core";
import type { Task } from "~/types";
import { useWorkspaceStore } from "~/features/workspaces/stores";

type EditorState = { mode: "create" } | { mode: "edit"; task: Task } | null;

export const useTaskWorkbench = () => {
	const route = useRoute();
	const router = useRouter();
	const workspaceSlug = computed(() => String(route.params.slug ?? ""));
	const activeTaskId = computed(() => (typeof route.query.taskId === "string" ? route.query.taskId : ""));
	const { workspace } = storeToRefs(useWorkspaceStore());
	const viewMode = ref<"list" | "board">("list");
	const searchInput = ref("");
	const search = refDebounced(searchInput, 180);
	const statusFilter = ref<"all" | Task["status"]>("all");
	const priorityFilter = ref<"all" | Task["priority"]>("all");
	const editor = ref<EditorState>(null);

	const {
		data: taskPages,
		isFetching,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: computed(() => ["workspace-tasks", workspaceSlug.value]),
		// Filtering and board grouping both happen client-side, so the workbench
		// needs the whole workspace rather than the first page the API returns.
		queryFn: () => fetchAllPages<Task>(API_ENDPOINTS.workspaces.tasks(workspaceSlug.value)),
		enabled: computed(() => Boolean(workspaceSlug.value)),
	});

	const tasks = computed(() => taskPages.value?.data ?? []);
	const totalTasks = computed(() => taskPages.value?.total ?? 0);
	const isTaskListTruncated = computed(() => Boolean(taskPages.value?.truncated));

	const filteredTasks = computed(() => {
		const needle = search.value.trim().toLowerCase();
		return tasks.value
			.filter((task) => statusFilter.value === "all" || task.status === statusFilter.value)
			.filter((task) => priorityFilter.value === "all" || task.priority === priorityFilter.value)
			.filter((task) => !needle || `${task.title} ${task.description}`.toLowerCase().includes(needle))
			.sort((a, b) => {
				if (!a.dueDate) return 1;
				if (!b.dueDate) return -1;
				return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
			});
	});

	const columns = computed(() =>
		(
			[
				["todo", "To do"],
				["in_progress", "In progress"],
				["done", "Done"],
			] as const
		).map(([status, label]) => ({ status, label, tasks: filteredTasks.value.filter((task) => task.status === status) }))
	);
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
	const clearFilters = () => {
		searchInput.value = "";
		statusFilter.value = "all";
		priorityFilter.value = "all";
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
	};
};
