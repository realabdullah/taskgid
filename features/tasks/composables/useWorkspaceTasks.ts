import { keepPreviousData, useQuery } from "@tanstack/vue-query";
import type { PaginatedResponse, Task } from "~/types";
import { toTaskQuery, type TaskFilters } from "./useTaskFilters";

export const TASKS_PER_PAGE = 25;

/**
 * The list view's server-filtered page of tasks.
 *
 * Everything the toolbar offers is applied by the API, so the totals shown are
 * the workspace's totals rather than the current page's.
 */
export const useWorkspaceTasks = (workspaceSlug: Ref<string>, filters: Ref<TaskFilters>) => {
	const query = useQuery({
		queryKey: computed(() => ["workspace-tasks", workspaceSlug.value, toTaskQuery(filters.value, { page: filters.value.page })]),
		queryFn: async () => {
			const response = await useApiFetch<PaginatedResponse<Task>>(API_ENDPOINTS.workspaces.taskSearch(workspaceSlug.value), {
				query: toTaskQuery(filters.value, { page: filters.value.page, limit: TASKS_PER_PAGE }),
			});
			if (!response?.success || !response.data) throw new Error("Unable to load tasks. Try again.");
			return response;
		},
		enabled: computed(() => Boolean(workspaceSlug.value)),
		// Paging swaps the page in place instead of flashing the skeleton.
		placeholderData: keepPreviousData,
	});

	return {
		...query,
		tasks: computed(() => query.data.value?.data ?? []),
		pagination: computed(() => query.data.value?.pagination),
	};
};
