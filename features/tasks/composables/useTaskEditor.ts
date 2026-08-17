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
	assignees: string[];
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
	assignees: task?.assignees.map((assignee) => assignee.username) ?? [],
});

/** `YYYY-MM-DD` in the user's own timezone, which is what `<input type="date">` expects. */
const toDateInputValue = (date: Date) => {
	const offset = date.getTimezoneOffset() * 60_000;
	return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const addDays = (days: number) => {
	const date = new Date();
	date.setDate(date.getDate() + days);
	return toDateInputValue(date);
};

export const useTaskEditor = (options: TaskEditorOptions) => {
	const queryClient = useQueryClient();
	const { teams } = storeToRefs(useWorkspaceStore());
	const draft = reactive<TaskDraft>(toDraft(options.task));
	const isSubmitting = ref(false);
	const titleError = computed(() => (!draft.title.trim() ? "Add a task title." : ""));
	const canSave = computed(() => !titleError.value && !isSubmitting.value);

	/** Shortcuts for the dates people actually pick, so the calendar stays optional. */
	const dueDatePresets = computed(() => [
		{ label: "Today", value: addDays(0) },
		{ label: "Tomorrow", value: addDays(1) },
		{ label: "Next week", value: addDays(7) },
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
				},
			});
			if (!success || !data) throw new Error(error || "Unable to save the task. Try again.");
			await queryClient.invalidateQueries({ queryKey: ["workspace-tasks", options.workspaceSlug] });
			toast.success(isEditing ? "Task updated." : "Task created.");
			options.onSaved(data);
		} catch (error) {
			toast.error(getServerError(error));
		} finally {
			isSubmitting.value = false;
		}
	};

	return { canSave, draft, dueDatePresets, isSubmitting, saveTask, setDueDate, teams, titleError, toggleAssignee };
};
