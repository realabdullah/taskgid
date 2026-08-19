import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import type { ApiResponse, PaginatedResponse, Task } from "~/types";

/** A parent can hold this many children before the inspector stops offering to add more. */
export const MAX_SUBTASKS = 50;

/**
 * One task's children, and the two ways to change the set.
 *
 * Subtasks are fetched by parent rather than filtered out of a cached page: the
 * lists deliberately exclude them, so there is no page they could be read from.
 * Everything else about a subtask — editing it, assigning it, completing it —
 * goes through the ordinary task mutations, because a subtask is a task.
 */
export const useTaskSubtasks = (workspaceSlug: MaybeRefOrGetter<string>, parentId: MaybeRefOrGetter<string>) => {
	const client = useQueryClient();
	const slug = computed(() => toValue(workspaceSlug));
	const parent = computed(() => toValue(parentId));

	const query = useQuery({
		queryKey: computed(() => ["task-subtasks", slug.value, parent.value]),
		queryFn: async () => {
			const response = await useApiFetch<PaginatedResponse<Task>>(API_ENDPOINTS.workspaces.taskSearch(slug.value), {
				query: { parentId: parent.value, sortBy: "createdAt", sortOrder: "ASC", page: 1, limit: MAX_SUBTASKS },
			});
			if (!response?.success) throw new Error("Unable to load subtasks. Try again.");
			return response.data ?? [];
		},
		enabled: computed(() => Boolean(slug.value && parent.value)),
	});

	const settle = async () => {
		await Promise.all([
			client.invalidateQueries({ queryKey: ["task-subtasks", slug.value, parent.value] }),
			// The parent's own row carries the progress figure.
			client.invalidateQueries({ queryKey: ["workspace-tasks"] }),
			client.invalidateQueries({ queryKey: ["workspace-tasks-column"] }),
			client.invalidateQueries({ queryKey: ["task", parent.value] }),
			client.invalidateQueries({ queryKey: ["workspace-stats", slug.value] }),
		]);
	};

	const addSubtask = useMutation({
		mutationFn: async (title: string) => {
			const response = await useApiFetch<ApiResponse<Task>>(API_ENDPOINTS.workspaces.tasks(slug.value), {
				method: "POST",
				body: { title, parentId: parent.value },
			});
			if (!response?.success) throw new Error(response?.error || "Unable to add the subtask. Try again.");
			return response.data;
		},
		onError: (error) => toast.error(getServerError(error)),
		onSettled: () => void settle(),
	});

	/*
	 * Detaching promotes a subtask back to the top level rather than deleting
	 * it. A subtask carries its own assignee and due date, so "remove from this
	 * parent" and "throw the work away" have to stay separate actions.
	 */
	const detachSubtask = useMutation({
		mutationFn: async (taskId: string) => {
			const response = await useApiFetch<ApiResponse<Task>>(API_ENDPOINTS.workspaces.taskById(slug.value, taskId), {
				method: "PATCH",
				body: { parentId: null },
			});
			if (!response?.success) throw new Error(response?.error || "Unable to detach the subtask. Try again.");
			return response.data;
		},
		onSuccess: () => toast.success("Moved to the top level"),
		onError: (error) => toast.error(getServerError(error)),
		onSettled: () => void settle(),
	});

	const subtasks = computed(() => query.data.value ?? []);
	const done = computed(() => subtasks.value.filter((task) => task.status === "done").length);

	return {
		...query,
		subtasks,
		done,
		total: computed(() => subtasks.value.length),
		isFull: computed(() => subtasks.value.length >= MAX_SUBTASKS),
		addSubtask,
		detachSubtask,
	};
};
