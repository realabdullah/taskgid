import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import type { ApiResponse, BaseUser } from "~/types";

export type WorkspaceApiKey = {
	id: string;
	workspaceId: string;
	userId: string;
	name: string;
	keyPreview: string;
	lastUsedAt: string | null;
	revokedAt: string | null;
	createdAt: string;
	updatedAt: string;
	owner?: Pick<BaseUser, "id" | "username" | "firstName" | "lastName">;
};

export type CreatedWorkspaceApiKey = WorkspaceApiKey & {
	/** Raw secret, returned once at creation and never again. */
	key: string;
};

/**
 * Workspace API keys for MCP and other agent clients. Members manage their own
 * keys; admins see every key in the workspace.
 */
export const useWorkspaceApiKeys = (workspaceSlug: MaybeRefOrGetter<string>) => {
	const client = useQueryClient();
	const slug = computed(() => toValue(workspaceSlug));
	const key = computed(() => ["workspace-api-keys", slug.value]);

	const query = useQuery({
		queryKey: key,
		queryFn: async () => {
			const response = await useApiFetch<ApiResponse<WorkspaceApiKey[]>>(API_ENDPOINTS.workspaces.apiKeys(slug.value));
			if (!response?.success) throw new Error("Unable to load API keys.");
			return response.data ?? [];
		},
		enabled: computed(() => Boolean(slug.value)),
	});

	const invalidate = () => client.invalidateQueries({ queryKey: key.value });

	const create = useMutation({
		mutationFn: async (name: string) => {
			const response = await useApiFetch<ApiResponse<CreatedWorkspaceApiKey>>(API_ENDPOINTS.workspaces.apiKeys(slug.value), {
				method: "POST",
				body: { name },
			});
			if (!response?.success || !response.data?.key) {
				throw new Error((response as { error?: string })?.error || "Unable to create an API key.");
			}
			return response.data;
		},
		onSuccess: async () => {
			await invalidate();
		},
		onError: (error) => toast.error(getServerError(error)),
	});

	const revoke = useMutation({
		mutationFn: async (keyId: string) => {
			const response = await useApiFetch<ApiResponse>(API_ENDPOINTS.workspaces.apiKeyById(slug.value, keyId), {
				method: "DELETE",
			});
			if (!response?.success) {
				throw new Error((response as { error?: string })?.error || "Unable to revoke this API key.");
			}
		},
		onSuccess: async () => {
			await invalidate();
			toast.success("API key revoked.");
		},
		onError: (error) => toast.error(getServerError(error)),
	});

	return {
		keys: computed(() => query.data.value ?? []),
		isLoading: computed(() => query.isLoading.value),
		isError: computed(() => query.isError.value),
		error: computed(() => query.error.value),
		refetch: query.refetch,
		create,
		revoke,
	};
};
