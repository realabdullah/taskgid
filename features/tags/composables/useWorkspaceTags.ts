import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import { useWorkspacesStore } from "~/features/workspaces/stores";
import type { ApiResponse, Tag } from "~/types";

export type TagDraft = { name: string; color: string; description?: string };

/**
 * Workspace tags: the list every picker reads from, plus the management
 * mutations. Editing and deleting are admin-only server-side.
 */
export const useWorkspaceTags = (workspaceSlug: MaybeRefOrGetter<string>) => {
	const client = useQueryClient();
	const slug = computed(() => toValue(workspaceSlug));
	const tagsKey = computed(() => ["workspace-tags", slug.value]);

	// Renaming and deleting are admin-only server-side; the UI reflects that
	// rather than offering a control whose request will be refused.
	const { workspaces } = storeToRefs(useWorkspacesStore());
	const canManage = computed(() => {
		const role = workspaces.value?.find((workspace) => workspace.slug === slug.value)?.userRole;
		return ["admin", "owner", "creator"].includes(String(role ?? "").toLowerCase());
	});

	const query = useQuery({
		queryKey: tagsKey,
		queryFn: async () => {
			const { data } = await fetchAllPages<Tag>(API_ENDPOINTS.workspaces.tags(slug.value));
			return data;
		},
		enabled: computed(() => Boolean(slug.value)),
		staleTime: 5 * 60 * 1000,
	});

	const invalidate = async () => {
		await Promise.all([
			client.invalidateQueries({ queryKey: tagsKey.value }),
			// Tags are embedded in every task payload, so the lists go stale too.
			client.invalidateQueries({ queryKey: ["workspace-tasks"] }),
			client.invalidateQueries({ queryKey: ["workspace-tasks-column"] }),
		]);
	};

	const createTag = useMutation({
		mutationFn: async (draft: TagDraft) => {
			const response = await useApiFetch<ApiResponse<Tag>>(API_ENDPOINTS.workspaces.tags(slug.value), { method: "POST", body: draft });
			if (!response?.success) throw new Error(response?.error || "Unable to create the tag. Try again.");
			return response.data;
		},
		onSuccess: async () => {
			await invalidate();
			toast.success("Tag created.");
		},
		onError: (error) => toast.error(getServerError(error)),
	});

	const updateTag = useMutation({
		mutationFn: async ({ id, ...draft }: TagDraft & { id: string }) => {
			const response = await useApiFetch<ApiResponse<Tag>>(API_ENDPOINTS.workspaces.tagById(slug.value, id), { method: "PUT", body: draft });
			if (!response?.success) throw new Error(response?.error || "Unable to update the tag. Try again.");
			return response.data;
		},
		onSuccess: async () => {
			await invalidate();
			toast.success("Tag updated.");
		},
		onError: (error) => toast.error(getServerError(error)),
	});

	const deleteTag = useMutation({
		mutationFn: async (id: string) => {
			const response = await useApiFetch<ApiResponse>(API_ENDPOINTS.workspaces.tagById(slug.value, id), { method: "DELETE" });
			if (!response?.success) throw new Error(response?.error || "Unable to delete the tag. Try again.");
			return id;
		},
		onSuccess: async () => {
			await invalidate();
			toast.success("Tag deleted.");
		},
		onError: (error) => toast.error(getServerError(error)),
	});

	return {
		canManage,
		createTag,
		deleteTag,
		error: query.error,
		isError: query.isError,
		isLoading: query.isPending,
		refetch: query.refetch,
		tags: computed(() => query.data.value ?? []),
		updateTag,
	};
};
