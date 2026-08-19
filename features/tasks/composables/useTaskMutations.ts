import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import type { ApiResponse, PaginatedResponse, Task } from "~/types";

/** The fields a task can be changed to from a list, board, inspector or bulk action. */
export type TaskPatch = Partial<Pick<Task, "status" | "priority" | "title" | "description" | "checklist">> & {
	dueDate?: string | null;
	startDate?: string | null;
	estimateMinutes?: number | null;
	assignees?: string[];
	tags?: string[];
	/** Nests the task under a parent, or `null` to promote it back to the top level. */
	parentId?: string | null;
};

/** How long a deleted task can be brought back before the request is actually sent. */
export const UNDO_WINDOW_MS = 5000;

/**
 * The one path through which a task changes.
 *
 * The board, the list, the inspector and the bulk bar all mutate through here,
 * so optimistic updates, rollback and invalidation are defined once rather than
 * re-derived at each call site.
 */
export const useTaskMutations = (workspaceSlug: MaybeRefOrGetter<string>) => {
	const client = useQueryClient();
	const slug = computed(() => toValue(workspaceSlug));

	/** Every cached view of this workspace's tasks: the list page and each board column. */
	const taskListFilters = [{ queryKey: ["workspace-tasks"] }, { queryKey: ["workspace-tasks-column"] }];

	const invalidateLists = async () => {
		await Promise.all([
			...taskListFilters.map((filter) => client.invalidateQueries(filter)),
			client.invalidateQueries({ queryKey: ["dashboard-overview"] }),
			client.invalidateQueries({ queryKey: ["workspace-stats", slug.value] }),
			// A subtask's status feeds its parent's "3 of 5" figure, so the
			// parent's children list has to settle alongside the task lists.
			client.invalidateQueries({ queryKey: ["task-subtasks"] }),
		]);
	};

	/*
	 * Applies a change to every cached page holding the task, without refetching.
	 *
	 * Only the fields whose wire shape matches the cached shape are applied.
	 * `assignees` and `tags` are sent as names but come back as objects, so
	 * writing the request payload into the cache would corrupt what the list
	 * renders — those two settle on invalidation instead.
	 */
	const patchCaches = (taskId: string, patch: TaskPatch) => {
		const { assignees: _assignees, tags: _tags, ...displayable } = patch;
		if (Object.keys(displayable).length === 0) return;

		for (const filter of taskListFilters) {
			client.setQueriesData<PaginatedResponse<Task>>(filter, (current) =>
				current?.data ? { ...current, data: current.data.map((task) => (task.id === taskId ? { ...task, ...displayable } : task)) } : current
			);
		}
	};

	const removeFromCaches = (taskId: string) => {
		for (const filter of taskListFilters) {
			client.setQueriesData<PaginatedResponse<Task>>(filter, (current) => (current?.data ? { ...current, data: current.data.filter((task) => task.id !== taskId) } : current));
		}
	};

	const snapshot = () => taskListFilters.flatMap((filter) => client.getQueriesData<PaginatedResponse<Task>>(filter));
	const restore = (entries: ReturnType<typeof snapshot>) => {
		for (const [key, value] of entries) client.setQueryData(key, value);
	};

	const cancelListQueries = () => Promise.all(taskListFilters.map((filter) => client.cancelQueries(filter)));

	const updateTask = useMutation({
		mutationFn: async ({ taskId, patch }: { taskId: string; patch: TaskPatch }) => {
			const response = await useApiFetch<ApiResponse<Task>>(API_ENDPOINTS.workspaces.taskById(slug.value, taskId), { method: "PATCH", body: patch });
			if (!response?.success) throw new Error(response?.error || "Unable to update the task. Try again.");
			return response.data;
		},
		onMutate: async ({ taskId, patch }) => {
			await cancelListQueries();
			const previous = snapshot();
			patchCaches(taskId, patch);
			return { previous };
		},
		onError: (error, _variables, context) => {
			if (context?.previous) restore(context.previous);
			toast.error(getServerError(error));
		},
		onSettled: () => void invalidateLists(),
	});

	/**
	 * Deletes with a grace period rather than a confirmation dialog: the task
	 * leaves the list at once and the request only goes out once the undo window
	 * closes, so undo costs nothing and needs no restore endpoint.
	 */
	const deleteTaskWithUndo = (task: Task, options: { onDeleted?: () => void } = {}) => {
		let undone = false;
		const previous = snapshot();
		removeFromCaches(task.id);

		const timer = setTimeout(async () => {
			if (undone) return;
			try {
				const response = await useApiFetch<ApiResponse>(API_ENDPOINTS.workspaces.taskById(slug.value, task.id), { method: "DELETE" });
				if (!response?.success) throw new Error(response?.error || "Unable to delete the task.");
				options.onDeleted?.();
			} catch (error) {
				restore(previous);
				toast.error(getServerError(error));
			} finally {
				void invalidateLists();
			}
		}, UNDO_WINDOW_MS);

		toast(`Deleted “${task.title}”`, {
			duration: UNDO_WINDOW_MS,
			action: {
				label: "Undo",
				onClick: () => {
					undone = true;
					clearTimeout(timer);
					restore(previous);
				},
			},
		});
	};

	/**
	 * Applies one change across a selection.
	 *
	 * There is no batch endpoint for status, priority, due date or tags, so this
	 * fans out — but it reports partial failure honestly instead of claiming
	 * success when some requests were rejected.
	 */
	const bulkUpdate = useMutation({
		mutationFn: async ({ taskIds, patch }: { taskIds: string[]; patch: TaskPatch }) => {
			const results = await Promise.allSettled(taskIds.map((taskId) => useApiFetch<ApiResponse<Task>>(API_ENDPOINTS.workspaces.taskById(slug.value, taskId), { method: "PATCH", body: patch })));
			const failed = results.filter((result) => result.status === "rejected").length;
			return { total: taskIds.length, failed };
		},
		onMutate: async ({ taskIds, patch }) => {
			await cancelListQueries();
			const previous = snapshot();
			for (const taskId of taskIds) patchCaches(taskId, patch);
			return { previous };
		},
		onError: (error, _variables, context) => {
			if (context?.previous) restore(context.previous);
			toast.error(getServerError(error));
		},
		onSuccess: ({ total, failed }) => {
			if (failed === 0) toast.success(`Updated ${total} task${total === 1 ? "" : "s"}.`);
			else toast.warning(`Updated ${total - failed} of ${total}. ${failed} could not be changed.`);
		},
		onSettled: () => void invalidateLists(),
	});

	/** Assignment has a real batch endpoint, and it takes a user id rather than a username. */
	const bulkAssign = useMutation({
		mutationFn: async ({ taskIds, assigneeId }: { taskIds: string[]; assigneeId: string }) => {
			const response = await useApiFetch<ApiResponse<unknown>>(API_ENDPOINTS.workspaces.batchAssignTasks(slug.value), {
				method: "POST",
				body: { taskIds, assigneeId },
			});
			if (!response?.success) throw new Error(response?.error || "Unable to assign those tasks. Try again.");
			return response;
		},
		onSuccess: () => toast.success("Tasks assigned."),
		onError: (error) => toast.error(getServerError(error)),
		onSettled: () => void invalidateLists(),
	});

	const bulkDeleteWithUndo = (tasks: Task[]) => {
		let undone = false;
		const previous = snapshot();
		for (const task of tasks) removeFromCaches(task.id);

		const timer = setTimeout(async () => {
			if (undone) return;
			const results = await Promise.allSettled(tasks.map((task) => useApiFetch<ApiResponse>(API_ENDPOINTS.workspaces.taskById(slug.value, task.id), { method: "DELETE" })));
			const failed = results.filter((result) => result.status === "rejected").length;
			if (failed) {
				restore(previous);
				toast.error(`${failed} task${failed === 1 ? "" : "s"} could not be deleted.`);
			}
			void invalidateLists();
		}, UNDO_WINDOW_MS);

		toast(`Deleted ${tasks.length} task${tasks.length === 1 ? "" : "s"}`, {
			duration: UNDO_WINDOW_MS,
			action: {
				label: "Undo",
				onClick: () => {
					undone = true;
					clearTimeout(timer);
					restore(previous);
				},
			},
		});
	};

	return { bulkAssign, bulkDeleteWithUndo, bulkUpdate, deleteTaskWithUndo, updateTask };
};
