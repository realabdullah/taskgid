import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import type { Task } from "~/types";

type TaskInspectorOptions = {
	workspaceSlug: MaybeRefOrGetter<string>;
	taskId: MaybeRefOrGetter<string>;
	onDeleted: () => void;
};

export const useTaskInspector = ({ workspaceSlug, taskId, onDeleted }: TaskInspectorOptions) => {
	const queryClient = useQueryClient();
	const isDeleteOpen = ref(false);
	const isDeleting = ref(false);

	const query = useQuery({
		queryKey: computed(() => ["task", toValue(taskId)]),
		queryFn: async () => {
			const { success, data } = await useApiFetch<{ success: boolean; data: Task }>(API_ENDPOINTS.workspaces.taskById(toValue(workspaceSlug), toValue(taskId)));
			if (!success || !data) throw new Error("Unable to load this task. Try again.");
			return data;
		},
		enabled: computed(() => Boolean(toValue(workspaceSlug) && toValue(taskId))),
	});

	const deleteTask = async () => {
		try {
			isDeleting.value = true;
			const { success } = await useApiFetch<{ success: boolean }>(API_ENDPOINTS.workspaces.taskById(toValue(workspaceSlug), toValue(taskId)), {
				method: "DELETE",
			});
			if (!success) throw new Error("Unable to delete this task. Try again.");
			await queryClient.invalidateQueries({ queryKey: ["workspace-tasks", toValue(workspaceSlug)] });
			toast.success("Task deleted.");
			onDeleted();
		} catch (error) {
			toast.error(getServerError(error));
		} finally {
			isDeleting.value = false;
			isDeleteOpen.value = false;
		}
	};

	return { ...query, isDeleteOpen, isDeleting, deleteTask };
};
