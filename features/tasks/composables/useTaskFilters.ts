import type { LocationQueryRaw } from "vue-router";
import type { Task } from "~/types";

export type TaskSortField = "createdAt" | "updatedAt" | "dueDate" | "priority" | "title" | "status";
export type TaskSortOrder = "ASC" | "DESC";
export type TaskViewMode = "list" | "board";

/**
 * The workbench query, as the server understands it. Every field is held in the
 * URL, so a filtered view survives a reload and can be pasted to a teammate.
 */
export type TaskFilters = {
	search: string;
	status: Task["status"][];
	priority: Task["priority"][];
	tags: string[];
	/** `me`, `unassigned`, a username, or empty for everyone. */
	assignee: string;
	sortBy: TaskSortField;
	sortOrder: TaskSortOrder;
	page: number;
	view: TaskViewMode;
};

const SORT_FIELDS: TaskSortField[] = ["createdAt", "updatedAt", "dueDate", "priority", "title", "status"];
const STATUSES: Task["status"][] = ["todo", "in_progress", "done"];
const PRIORITIES: Task["priority"][] = ["low", "medium", "high"];

const readString = (value: unknown) => (typeof value === "string" ? value : "");

/** The API parses list params as comma-separated, so the URL uses the same form. */
const readList = <T extends string>(value: unknown, allowed?: readonly T[]): T[] => {
	const parts = readString(value)
		.split(",")
		.map((part) => part.trim())
		.filter(Boolean) as T[];
	const unique = [...new Set(parts)];
	return allowed ? unique.filter((part) => allowed.includes(part)) : unique;
};

const readEnum = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T => {
	const parsed = readString(value) as T;
	return allowed.includes(parsed) ? parsed : fallback;
};

/**
 * Reads and writes the workbench query as URL parameters.
 *
 * Filter changes are written in a single navigation so a change and its page
 * reset never produce two history entries or two refetches.
 */
export const useTaskFilters = () => {
	const route = useRoute();
	const router = useRouter();

	const filters = computed<TaskFilters>(() => ({
		search: readString(route.query.q),
		status: readList(route.query.status, STATUSES),
		priority: readList(route.query.priority, PRIORITIES),
		tags: readList(route.query.tags),
		assignee: readString(route.query.assignee),
		sortBy: readEnum(route.query.sort, SORT_FIELDS, "createdAt"),
		sortOrder: readEnum(route.query.order, ["ASC", "DESC"] as const, "DESC"),
		page: Math.max(1, Number(route.query.page) || 1),
		view: readEnum(route.query.view, ["list", "board"] as const, "list"),
	}));

	/** True when anything narrows the list — the view mode and sort do not. */
	const isFiltered = computed(() => Boolean(filters.value.search || filters.value.assignee) || filters.value.status.length > 0 || filters.value.priority.length > 0 || filters.value.tags.length > 0);

	const activeFilterCount = computed(
		() => (filters.value.search ? 1 : 0) + (filters.value.assignee ? 1 : 0) + filters.value.status.length + filters.value.priority.length + filters.value.tags.length
	);

	const writeQuery = (next: Partial<TaskFilters>, { resetPage = true }: { resetPage?: boolean } = {}) => {
		const merged = { ...filters.value, ...next };
		if (resetPage && next.page === undefined) merged.page = 1;

		// Only non-default values reach the URL, so a clean view has a clean link.
		// Parameters this composable does not own (taskId, create) are carried over.
		const owned = ["q", "status", "priority", "tags", "assignee", "sort", "order", "page", "view"];
		const query: LocationQueryRaw = Object.fromEntries(Object.entries(route.query).filter(([key]) => !owned.includes(key)));
		const set = (key: string, value: string | number | undefined) => {
			if (value === undefined || value === "" || value === 0) return;
			query[key] = String(value);
		};

		set("q", merged.search);
		set("status", merged.status.join(","));
		set("priority", merged.priority.join(","));
		set("tags", merged.tags.join(","));
		set("assignee", merged.assignee);
		set("sort", merged.sortBy === "createdAt" ? "" : merged.sortBy);
		set("order", merged.sortOrder === "DESC" ? "" : merged.sortOrder);
		set("page", merged.page > 1 ? merged.page : "");
		set("view", merged.view === "list" ? "" : merged.view);

		return router.replace({ query });
	};

	/** Adds or removes one value from a multi-select filter. */
	const toggleInList = <K extends "status" | "priority" | "tags">(key: K, value: TaskFilters[K][number]) => {
		const current = filters.value[key] as string[];
		const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
		return writeQuery({ [key]: next } as Partial<TaskFilters>);
	};

	const clearFilters = () => writeQuery({ search: "", status: [], priority: [], tags: [], assignee: "" });

	return { activeFilterCount, clearFilters, filters, isFiltered, toggleInList, writeQuery };
};

/** Maps the filter set onto the query string the tasks endpoints expect. */
export const toTaskQuery = (filters: TaskFilters, overrides: Record<string, unknown> = {}) => ({
	...(filters.search ? { search: filters.search } : {}),
	...(filters.status.length ? { status: filters.status.join(",") } : {}),
	...(filters.priority.length ? { priority: filters.priority.join(",") } : {}),
	...(filters.tags.length ? { tags: filters.tags.join(",") } : {}),
	...(filters.assignee ? { assignee: filters.assignee } : {}),
	sortBy: filters.sortBy,
	sortOrder: filters.sortOrder,
	...overrides,
});
