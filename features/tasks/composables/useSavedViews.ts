import { useLocalStorage } from "@vueuse/core";

export type SavedView = {
	id: string;
	name: string;
	/** The workbench query string, e.g. `status=todo&assignee=me`. */
	query: string;
	/** Built-ins ship with the app and cannot be renamed or deleted. */
	isBuiltIn?: boolean;
};

const BUILT_IN_VIEWS: SavedView[] = [
	{ id: "built-in:my-open-work", name: "My open work", query: "assignee=me&status=todo,in_progress", isBuiltIn: true },
	{ id: "built-in:overdue", name: "Overdue", query: "status=todo,in_progress&sort=dueDate&order=ASC", isBuiltIn: true },
	{ id: "built-in:unassigned", name: "Unassigned", query: "assignee=unassigned&status=todo,in_progress", isBuiltIn: true },
];

/**
 * Named filter sets, stored per workspace.
 *
 * A view is just the workbench's query string, which is why this can live in
 * localStorage today and move to the server later without changing its payload.
 */
export const useSavedViews = (workspaceSlug: MaybeRefOrGetter<string>) => {
	const route = useRoute();
	const router = useRouter();
	const slug = computed(() => toValue(workspaceSlug));

	const stored = useLocalStorage<Record<string, SavedView[]>>("taskgid:saved-views", {});
	const views = computed(() => [...BUILT_IN_VIEWS, ...(stored.value[slug.value] ?? [])]);

	/** The parameters a view owns. `taskId` and `view` are not part of a filter set. */
	const FILTER_KEYS = ["q", "status", "priority", "tags", "assignee", "sort", "order"];

	const currentQuery = computed(() => {
		const params = new URLSearchParams();
		for (const key of FILTER_KEYS) {
			const value = route.query[key];
			if (typeof value === "string" && value) params.set(key, value);
		}
		params.sort();
		return params.toString();
	});

	const normalise = (query: string) => {
		const source = new URLSearchParams(query);
		const params = new URLSearchParams();
		for (const key of FILTER_KEYS) {
			const value = source.get(key);
			if (value) params.set(key, value);
		}
		params.sort();
		return params.toString();
	};

	const activeView = computed(() => views.value.find((view) => normalise(view.query) === currentQuery.value));

	const applyView = (view: SavedView) => {
		const next = Object.fromEntries(new URLSearchParams(normalise(view.query)));
		// Selection and view mode survive switching views; filters are replaced wholesale.
		const preserved: Record<string, string> = {};
		for (const key of ["taskId", "view"]) {
			const value = route.query[key];
			if (typeof value === "string" && value) preserved[key] = value;
		}
		return router.replace({ query: { ...next, ...preserved } });
	};

	const saveCurrentAs = (name: string) => {
		const trimmed = name.trim();
		if (!trimmed) return;
		const view: SavedView = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: trimmed, query: currentQuery.value };
		stored.value = { ...stored.value, [slug.value]: [...(stored.value[slug.value] ?? []), view] };
		return view;
	};

	const deleteView = (id: string) => {
		stored.value = { ...stored.value, [slug.value]: (stored.value[slug.value] ?? []).filter((view) => view.id !== id) };
	};

	return { activeView, applyView, currentQuery, deleteView, saveCurrentAs, views };
};
