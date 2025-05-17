import { useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

export const useTasks = () => {
	const client = useQueryClient();
	const route = useRoute();

	const deleteTask = async (taskId: string, callback?: () => void) => {
		try {
			const url = `/workspaces/${route.params.slug}/tasks/${taskId}`;
			const { success, message } = await useApiFetch<{ success: boolean; message: string }>(url, { method: "DELETE" });
			if (success) {
				client.invalidateQueries({ queryKey: ["workspace-recent-tasks"] });
				toast(message || "Task deleted successfully");
				if (callback) callback();
				return;
			}

			throw new Error(message || "Failed to delete task");
		} catch (error) {
			console.error("Error deleting task:", error);
			toast(String(error) || "Failed to delete task");
		}
	};

	return { deleteTask };
};
