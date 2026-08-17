import { useApiFetch } from "~/composables/useApiFetch";
import type { PaginatedResponse } from "~/types";

/**
 * Every taskgid-api list endpoint pages its response. A request that omits
 * `limit` silently gets only the first page, so nothing in the app should call
 * one of those endpoints without saying how much it wants.
 */
export const LIST_PAGE_SIZE = 50;

/** `maxLimit` in the API's `getPaginationParams` — asking for more is capped server-side. */
export const LIST_MAX_PAGE_SIZE = 100;

type FetchAllPagesOptions = {
	/** Rows per request. Capped at the server's `maxLimit`. */
	limit?: number;
	/** Safety valve so a huge workspace cannot fan out into unbounded requests. */
	maxPages?: number;
	query?: Record<string, unknown>;
};

type FetchAllPagesResult<T> = {
	data: T[];
	/** Total the server reports, which may exceed `data.length` when `truncated`. */
	total: number;
	/** True when `maxPages` stopped us before the server ran out of rows. */
	truncated: boolean;
};

/**
 * Walk a paginated endpoint to the end and return every row.
 *
 * A stopgap for views that filter or group client-side. Views that move their
 * filters server-side should request a single page instead.
 */
export const fetchAllPages = async <T>(url: string, options: FetchAllPagesOptions = {}): Promise<FetchAllPagesResult<T>> => {
	const limit = Math.min(options.limit ?? LIST_MAX_PAGE_SIZE, LIST_MAX_PAGE_SIZE);
	const maxPages = options.maxPages ?? 20;

	const rows: T[] = [];
	let page = 1;
	let total = 0;

	for (; page <= maxPages; page++) {
		const response = await useApiFetch<PaginatedResponse<T>>(url, { method: "GET", query: { ...options.query, page, limit } });
		if (!response?.success || !response.data) throw new Error("Unable to load the full list. Try again.");

		rows.push(...response.data);
		total = response.pagination?.total ?? rows.length;
		if (!response.pagination?.hasNextPage) return { data: rows, total, truncated: false };
	}

	return { data: rows, total, truncated: true };
};
