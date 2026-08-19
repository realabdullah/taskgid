import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import type { ApiResponse } from "~/types";

export type SlackEventType = "task.created" | "task.updated" | "task.deleted" | "comment.created";

export type SlackInstallation = {
	id: string;
	workspaceId: string;
	teamId: string;
	teamName: string | null;
	botUserId: string | null;
	channelId: string | null;
	channelName: string | null;
	eventTypes: SlackEventType[];
	isActive: boolean;
	installedById: string;
	createdAt: string;
	updatedAt: string;
};

export type SlackChannel = {
	id: string;
	name: string;
	isPrivate: boolean;
};

export const SLACK_EVENT_OPTIONS: Array<{ type: SlackEventType; label: string; description: string }> = [
	{ type: "task.created", label: "Task created", description: "When someone adds a task." },
	{ type: "task.updated", label: "Task updated", description: "Status, priority, or other field changes." },
	{ type: "task.deleted", label: "Task deleted", description: "When a task is removed." },
	{ type: "comment.created", label: "Comments", description: "New comments on tasks." },
];

/**
 * Workspace Slack installation: connect, pick a channel, choose events.
 * Admin-only server-side; call sites should gate the section the same way.
 */
export const useWorkspaceSlack = (workspaceSlug: MaybeRefOrGetter<string>) => {
	const client = useQueryClient();
	const slug = computed(() => toValue(workspaceSlug));
	const key = computed(() => ["workspace-slack", slug.value]);

	const query = useQuery({
		queryKey: key,
		queryFn: async () => {
			const response = await useApiFetch<ApiResponse<SlackInstallation | null> & { configured?: boolean }>(
				API_ENDPOINTS.workspaces.slack(slug.value)
			);
			if (!response?.success) throw new Error("Unable to load Slack settings.");
			return {
				installation: response.data ?? null,
				configured: Boolean(response.configured),
			};
		},
		enabled: computed(() => Boolean(slug.value)),
	});

	const channelsQuery = useQuery({
		queryKey: computed(() => ["workspace-slack-channels", slug.value]),
		queryFn: async () => {
			const response = await useApiFetch<ApiResponse<SlackChannel[]>>(API_ENDPOINTS.workspaces.slackChannels(slug.value));
			if (!response?.success) throw new Error("Unable to load Slack channels.");
			return response.data ?? [];
		},
		enabled: computed(() => Boolean(slug.value && query.data.value?.installation)),
		staleTime: 60 * 1000,
	});

	const invalidate = async () => {
		await Promise.all([
			client.invalidateQueries({ queryKey: key.value }),
			client.invalidateQueries({ queryKey: ["workspace-slack-channels", slug.value] }),
		]);
	};

	const connect = useMutation({
		mutationFn: async () => {
			const response = await useApiFetch<ApiResponse<{ url: string }>>(API_ENDPOINTS.workspaces.slackConnect(slug.value), {
				method: "POST",
			});
			if (!response?.success || !response.data?.url) {
				throw new Error((response as { error?: string })?.error || "Unable to start Slack connection.");
			}
			return response.data.url;
		},
		onSuccess: (url) => {
			window.location.assign(url);
		},
		onError: (error) => toast.error(getServerError(error)),
	});

	const update = useMutation({
		mutationFn: async (patch: {
			channelId?: string | null;
			eventTypes?: SlackEventType[];
			isActive?: boolean;
		}) => {
			const response = await useApiFetch<ApiResponse<SlackInstallation>>(API_ENDPOINTS.workspaces.slack(slug.value), {
				method: "PATCH",
				body: patch,
			});
			if (!response?.success) throw new Error((response as { error?: string })?.error || "Unable to update Slack settings.");
			return response.data;
		},
		onSuccess: async () => {
			await invalidate();
			toast.success("Slack settings saved.");
		},
		onError: (error) => toast.error(getServerError(error)),
	});

	const disconnect = useMutation({
		mutationFn: async () => {
			const response = await useApiFetch<ApiResponse>(API_ENDPOINTS.workspaces.slack(slug.value), { method: "DELETE" });
			if (!response?.success) throw new Error((response as { error?: string })?.error || "Unable to disconnect Slack.");
		},
		onSuccess: async () => {
			await invalidate();
			toast.success("Slack disconnected.");
		},
		onError: (error) => toast.error(getServerError(error)),
	});

	return {
		installation: computed(() => query.data.value?.installation ?? null),
		configured: computed(() => query.data.value?.configured ?? false),
		channels: computed(() => channelsQuery.data.value ?? []),
		isLoading: computed(() => query.isLoading.value),
		isError: computed(() => query.isError.value),
		error: computed(() => query.error.value),
		isChannelsLoading: computed(() => channelsQuery.isFetching.value),
		refetch: query.refetch,
		refetchChannels: channelsQuery.refetch,
		connect,
		update,
		disconnect,
	};
};
