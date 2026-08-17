import { useQuery, useQueryClient } from "@tanstack/vue-query";
import type { ApiResponse, Task } from "~/types";
import { useTaskMutations } from "./useTaskMutations";

type TaskInspectorOptions = {
	workspaceSlug: MaybeRefOrGetter<string>;
	taskId: MaybeRefOrGetter<string>;
	onDeleted: () => void;
};

export const useTaskInspector = ({ workspaceSlug, taskId, onDeleted }: TaskInspectorOptions) => {
	const { deleteTaskWithUndo } = useTaskMutations(workspaceSlug);
	const client = useQueryClient();

	const query = useQuery({
		queryKey: computed(() => ["task", toValue(taskId)]),
		queryFn: async () => {
			const { success, data } = await useApiFetch<ApiResponse<Task>>(API_ENDPOINTS.workspaces.taskById(toValue(workspaceSlug), toValue(taskId)));
			if (!success || !data) throw new Error("Unable to load this task. Try again.");
			return data;
		},
		enabled: computed(() => Boolean(toValue(workspaceSlug) && toValue(taskId))),
	});

	/*
	 * Opening a task is what "reading" it means, so the marker is set here rather
	 * than behind a button. Failures are ignored: an unread badge that lingers is
	 * a far smaller problem than an error toast for something nobody asked for.
	 */
	watch(
		() => [toValue(workspaceSlug), toValue(taskId)] as const,
		async ([slug, id]) => {
			if (!slug || !id) return;
			try {
				await useApiFetch<ApiResponse>(API_ENDPOINTS.workspaces.taskRead(slug, id), { method: "POST" });
				void client.invalidateQueries({ queryKey: ["workspace-tasks"] });
				void client.invalidateQueries({ queryKey: ["workspace-tasks-column"] });
			} catch {
				// Non-fatal by design.
			}
		},
		{ immediate: true }
	);

	/*
	 * Deleting closes the panel immediately and offers an undo, rather than
	 * asking for confirmation first. The request is only sent once the undo
	 * window closes, so nothing needs to be restored server-side.
	 */
	const deleteTask = () => {
		const task = query.data.value;
		if (!task) return;
		deleteTaskWithUndo(task);
		onDeleted();
	};

	return { ...query, deleteTask };
};
