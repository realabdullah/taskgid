import { keepPreviousData, useQuery } from "@tanstack/vue-query";
import type { PaginatedResponse, Task } from "~/types";
import { toTaskQuery, type TaskFilters } from "./useTaskFilters";

const COLUMNS: Array<{ status: Task["status"]; label: string }> = [
	{ status: "todo", label: "To do" },
	{ status: "in_progress", label: "In progress" },
	{ status: "done", label: "Done" },
];

const COLUMN_PAGE_SIZE = 25;

/**
 * The board, as one query per column.
 *
 * A column asks the server for its own status, which keeps the header count
 * honest for the whole workspace rather than for whatever happened to be on the
 * current page. Columns page independently, so a long "To do" does not force
 * the other two to load rows nobody asked for.
 */
export const useTaskBoard = (workspaceSlug: Ref<string>, filters: Ref<TaskFilters>, enabled: Ref<boolean>) => {
	const visibleCount = ref<Record<Task["status"], number>>({ todo: COLUMN_PAGE_SIZE, in_progress: COLUMN_PAGE_SIZE, done: COLUMN_PAGE_SIZE });

	// The board shows all three statuses, so the toolbar's status filter would
	// only ever contradict it — it is dropped rather than silently emptying columns.
	const boardFilters = computed<TaskFilters>(() => ({ ...filters.value, status: [], page: 1 }));

	const columnQueries = COLUMNS.map((column) => {
		const query = useQuery({
			queryKey: computed(() => ["workspace-tasks-column", workspaceSlug.value, column.status, toTaskQuery(boardFilters.value), visibleCount.value[column.status]]),
			queryFn: async () => {
				const response = await useApiFetch<PaginatedResponse<Task>>(API_ENDPOINTS.workspaces.taskSearch(workspaceSlug.value), {
					query: toTaskQuery(boardFilters.value, { status: column.status, page: 1, limit: visibleCount.value[column.status] }),
				});
				if (!response?.success || !response.data) throw new Error(`Unable to load the ${column.label} column. Try again.`);
				return response;
			},
			enabled: computed(() => Boolean(workspaceSlug.value) && enabled.value),
			placeholderData: keepPreviousData,
		});
		return { column, query };
	});

	const columns = computed(() =>
		columnQueries.map(({ column, query }) => ({
			status: column.status,
			label: column.label,
			tasks: query.data.value?.data ?? [],
			total: query.data.value?.pagination?.total ?? 0,
			hasMore: Boolean(query.data.value?.pagination?.hasNextPage),
			isLoading: query.isPending.value,
			isError: query.isError.value,
		}))
	);

	const isBoardLoading = computed(() => columnQueries.some(({ query }) => query.isPending.value));
	const isBoardError = computed(() => columnQueries.some(({ query }) => query.isError.value));
	const boardError = computed(() => columnQueries.find(({ query }) => query.isError.value)?.query.error.value);
	const refetchBoard = () => Promise.all(columnQueries.map(({ query }) => query.refetch()));
	const loadMore = (status: Task["status"]) => {
		visibleCount.value = { ...visibleCount.value, [status]: visibleCount.value[status] + COLUMN_PAGE_SIZE };
	};

	return { boardError, columns, isBoardError, isBoardLoading, loadMore, refetchBoard };
};
