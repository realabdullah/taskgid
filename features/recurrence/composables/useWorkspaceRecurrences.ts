import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import type { ApiResponse, PaginatedResponse, TaskRecurrence } from "~/types";

export type RecurrenceDraftPayload = {
	title: string;
	rrule: string;
	description?: string;
	priority?: TaskRecurrence["priority"];
	estimateMinutes?: number | null;
	timezone?: string;
	assignees?: string[];
	tags?: string[];
	checklist?: { id: string; text: string; done: boolean }[];
};

/**
 * A workspace's recurrence rules.
 *
 * Editing a rule changes what future instances look like; it never touches the
 * tasks already produced, so the task caches do not need invalidating here.
 * Only the spawner creates tasks, and it runs from cron.
 */
export const useWorkspaceRecurrences = (workspaceSlug: MaybeRefOrGetter<string>) => {
	const client = useQueryClient();
	const slug = computed(() => toValue(workspaceSlug));
	const key = computed(() => ["workspace-recurrences", slug.value]);

	const query = useQuery({
		queryKey: key,
		queryFn: async () => {
			const response = await useApiFetch<PaginatedResponse<TaskRecurrence>>(API_ENDPOINTS.workspaces.recurrences(slug.value), {
				query: { page: 1, limit: 100 },
			});
			if (!response?.success) throw new Error("Unable to load recurring tasks. Try again.");
			return response.data ?? [];
		},
		enabled: computed(() => Boolean(slug.value)),
	});

	const invalidate = () => client.invalidateQueries({ queryKey: key.value });

	const createRecurrence = useMutation({
		mutationFn: async (draft: RecurrenceDraftPayload) => {
			const response = await useApiFetch<ApiResponse<TaskRecurrence>>(API_ENDPOINTS.workspaces.recurrences(slug.value), { method: "POST", body: draft });
			if (!response?.success) throw new Error(response?.error || "Unable to create the schedule. Try again.");
			return response.data;
		},
		onSuccess: async () => {
			await invalidate();
			toast.success("Schedule created.");
		},
		onError: (error) => toast.error(getServerError(error)),
	});

	const updateRecurrence = useMutation({
		mutationFn: async ({ id, ...patch }: Partial<RecurrenceDraftPayload> & { id: string; isActive?: boolean }) => {
			const response = await useApiFetch<ApiResponse<TaskRecurrence>>(API_ENDPOINTS.workspaces.recurrenceById(slug.value, id), { method: "PATCH", body: patch });
			if (!response?.success) throw new Error(response?.error || "Unable to update the schedule. Try again.");
			return response.data;
		},
		onSuccess: () => void invalidate(),
		onError: (error) => toast.error(getServerError(error)),
	});

	/*
	 * Deleting a schedule stops future instances and keeps every task it has
	 * already produced. The response says how many were kept, because "delete"
	 * reads as destructive and this one deliberately is not.
	 */
	const deleteRecurrence = useMutation({
		mutationFn: async (id: string) => {
			const response = await useApiFetch<ApiResponse<{ keptInstances: number }>>(API_ENDPOINTS.workspaces.recurrenceById(slug.value, id), { method: "DELETE" });
			if (!response?.success) throw new Error(response?.error || "Unable to delete the schedule. Try again.");
			return response.data;
		},
		onSuccess: async (data) => {
			await invalidate();
			const kept = data?.keptInstances ?? 0;
			toast.success(kept ? `Schedule deleted. ${kept} task${kept === 1 ? "" : "s"} it created were kept.` : "Schedule deleted.");
		},
		onError: (error) => toast.error(getServerError(error)),
	});

	return {
		...query,
		recurrences: computed(() => query.data.value ?? []),
		createRecurrence,
		updateRecurrence,
		deleteRecurrence,
	};
};
