import type { Pagination } from "./index";

/** Envelope every taskgid-api handler returns. */
export interface ApiResponse<T = undefined> {
	success: boolean;
	message?: string;
	error?: string;
	data: T;
}

/** Envelope returned by every endpoint built with `createPaginatedResponse`. */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
	pagination: Pagination;
}
