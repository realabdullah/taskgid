import { useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import type { ApiResponse, Task } from "~/types";
import { useWorkspaceStore } from "~/features/workspaces/stores";

type TaskDraft = {
	title: string;
	/** Rich text, stored as HTML — the task detail view renders it with `v-html`. */
	description: string;
	status: Task["status"];
	priority: Task["priority"];
	dueDate: string;
	startDate: string;
	/** Kept as a string so the input can be empty rather than zero. */
	estimate: string;
	assignees: string[];
	/** Tag **names** — the task endpoints resolve them to records themselves. */
	tags: string[];
};

type TaskEditorOptions = {
	workspaceSlug: string;
	task?: Task;
	onSaved: (task: Task) => void;
};

const toDraft = (task?: Task): TaskDraft => ({
	title: task?.title ?? "",
	description: task?.description ?? "",
	status: task?.status ?? "todo",
	priority: task?.priority ?? "medium",
	dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : "",
	startDate: task?.startDate ? task.startDate.slice(0, 10) : "",
	estimate: task?.estimateMinutes != null ? String(task.estimateMinutes) : "",
	assignees: task?.assignees.map((assignee) => assignee.username) ?? [],
	tags: task?.tags?.map((tag) => tag.name) ?? [],
});

/**
 * Due-date presets, resolved against the user's stored timezone rather than the
 * browser's, so "today" agrees with what the server considers overdue.
 */
const addDays = (days: number, timezone: string) => addDaysToKey(todayKey(timezone), days);

export const useTaskEditor = (options: TaskEditorOptions) => {
	const queryClient = useQueryClient();
	const { teams } = storeToRefs(useWorkspaceStore());
	const timezone = useUserTimezone();
	const draft = reactive<TaskDraft>(toDraft(options.task));
	const isSubmitting = ref(false);
	const titleError = computed(() => (!draft.title.trim() ? "Add a task title." : ""));
	const dateError = computed(() => (draft.startDate && draft.dueDate && draft.startDate > draft.dueDate ? "Start date is after the due date." : ""));
	const estimateError = computed(() => {
		const raw = draft.estimate.trim();
		if (!raw) return "";
		const value = Number(raw);
		return Number.isInteger(value) && value >= 0 ? "" : "Estimate must be a whole number of minutes.";
	});
	const formError = computed(() => titleError.value || dateError.value || estimateError.value);
	const canSave = computed(() => !formError.value && !isSubmitting.value);

	/** Shortcuts for the dates people actually pick, so the calendar stays optional. */
	const dueDatePresets = computed(() => [
		{ label: "Today", value: addDays(0, timezone.value) },
		{ label: "Tomorrow", value: addDays(1, timezone.value) },
		{ label: "Next week", value: addDays(7, timezone.value) },
	]);

	watch(
		() => options.task,
		(task) => Object.assign(draft, toDraft(task)),
		{ deep: true }
	);

	const toggleAssignee = (username: string) => {
		draft.assignees = draft.assignees.includes(username) ? draft.assignees.filter((value) => value !== username) : [...draft.assignees, username];
	};

	const setDueDate = (value: string) => {
		draft.dueDate = draft.dueDate === value ? "" : value;
	};

	const saveTask = async () => {
		if (!canSave.value) return;
		try {
			isSubmitting.value = true;
			const isEditing = Boolean(options.task);
			const url = isEditing ? API_ENDPOINTS.workspaces.taskById(options.workspaceSlug, options.task?.id) : API_ENDPOINTS.workspaces.tasks(options.workspaceSlug);
			const { success, data, error } = await useApiFetch<ApiResponse<Task>>(url, {
				method: isEditing ? "PATCH" : "POST",
				body: {
					...draft,
					title: draft.title.trim(),
					description: draft.description.trim(),
					dueDate: draft.dueDate ? new Date(`${draft.dueDate}T12:00:00`).toISOString() : undefined,
					startDate: draft.startDate ? new Date(`${draft.startDate}T12:00:00`).toISOString() : null,
					// Blank clears the estimate; the API rejects a non-numeric value.
					estimateMinutes: draft.estimate.trim() ? Number(draft.estimate) : null,
					estimate: undefined,
				},
			});
			if (!success || !data) throw new Error(error || "Unable to save the task. Try again.");
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["workspace-tasks", options.workspaceSlug] }),
				queryClient.invalidateQueries({ queryKey: ["workspace-tasks-column", options.workspaceSlug] }),
				queryClient.invalidateQueries({ queryKey: ["workspace-tags", options.workspaceSlug] }),
			]);
			toast.success(isEditing ? "Task updated." : "Task created.");
			options.onSaved(data);
		} catch (error) {
			toast.error(getServerError(error));
		} finally {
			isSubmitting.value = false;
		}
	};

	return { canSave, dateError, draft, dueDatePresets, estimateError, formError, isSubmitting, saveTask, setDueDate, teams, titleError, toggleAssignee };
};
