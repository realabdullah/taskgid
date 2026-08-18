import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import type { ApiResponse } from "~/types";

export type NotificationPreferences = {
	taskAssigned: boolean;
	taskUpdated: boolean;
	taskCompleted: boolean;
	commentCreated: boolean;
	commentLiked: boolean;
	mentioned: boolean;
	workspaceInvite: boolean;
	inAppEnabled: boolean;
	emailEnabled: boolean;
	dailyDigest: boolean;
	weeklyDigest: boolean;
	quietHoursStart: number | null;
	quietHoursEnd: number | null;
	timezone: string;
	hasOverride?: boolean;
};

/** The switches, in the order they read best — most specific first. */
export const EVENT_SETTINGS: Array<{ key: keyof NotificationPreferences; label: string; description: string }> = [
	{ key: "mentioned", label: "Mentions", description: "When a teammate writes your name in a task or comment." },
	{ key: "taskAssigned", label: "Task assigned to me", description: "When work becomes yours." },
	{ key: "commentCreated", label: "Comments", description: "New comments on tasks you own or are assigned to." },
	{ key: "taskUpdated", label: "Task changes", description: "Status, priority or due date changes on your tasks." },
	{ key: "taskCompleted", label: "Task completed", description: "When something you are involved in is finished." },
	{ key: "commentLiked", label: "Reactions", description: "When someone likes your comment." },
	{ key: "workspaceInvite", label: "Workspace invites", description: "When you are invited to a workspace." },
];

/** `HH:MM` in the user's own timezone, which is how quiet hours are stored. */
export const minutesToTime = (minutes: number | null) => {
	if (minutes === null) return "";
	return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
};

export const timeToMinutes = (value: string) => {
	if (!value) return null;
	const [hours, minutes] = value.split(":").map(Number);
	if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
	return hours * 60 + minutes;
};

/**
 * Notification settings for the account, or for one workspace when a slug is
 * given. A workspace row overrides the account-wide default server-side.
 */
export const useNotificationPreferences = (workspaceSlug?: MaybeRefOrGetter<string | undefined>) => {
	const client = useQueryClient();
	const slug = computed(() => toValue(workspaceSlug) || "");
	const key = computed(() => ["notification-preferences", slug.value]);

	const query = useQuery({
		queryKey: key,
		queryFn: async () => {
			const response = await useApiFetch<ApiResponse<NotificationPreferences>>(API_ENDPOINTS.notifications.preferences, {
				query: slug.value ? { workspaceSlug: slug.value } : {},
			});
			if (!response?.success) throw new Error("Unable to load your notification settings.");
			return response.data;
		},
	});

	const save = useMutation({
		mutationFn: async (patch: Partial<NotificationPreferences>) => {
			const response = await useApiFetch<ApiResponse<NotificationPreferences>>(API_ENDPOINTS.notifications.preferences, {
				method: "PUT",
				body: { ...patch, ...(slug.value ? { workspaceSlug: slug.value } : {}) },
			});
			if (!response?.success) throw new Error(response?.error || "Unable to save your notification settings.");
			return response.data;
		},
		onSuccess: () => {
			void client.invalidateQueries({ queryKey: ["notification-preferences"] });
			toast.success("Notification settings saved.");
		},
		onError: (error) => toast.error(getServerError(error)),
	});

	const clearOverride = useMutation({
		mutationFn: async () => {
			if (!slug.value) return null;
			const response = await useApiFetch<ApiResponse<NotificationPreferences>>(API_ENDPOINTS.notifications.workspacePreferences(slug.value), { method: "DELETE" });
			if (!response?.success) throw new Error("Unable to reset this workspace.");
			return response.data;
		},
		onSuccess: () => {
			void client.invalidateQueries({ queryKey: ["notification-preferences"] });
			toast.success("This workspace follows your account settings again.");
		},
		onError: (error) => toast.error(getServerError(error)),
	});

	/** The browser's own zone, offered when the stored one looks like the default. */
	const detectedTimezone = computed(() => {
		try {
			return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
		} catch {
			return "UTC";
		}
	});

	const preferences = computed(() => query.data.value);
	const quietHoursEnabled = computed(() => preferences.value?.quietHoursStart !== null && preferences.value?.quietHoursEnd !== null);

	const setQuietHours = (start: string, end: string) => save.mutate({ quietHoursStart: timeToMinutes(start), quietHoursEnd: timeToMinutes(end) });
	const disableQuietHours = () => save.mutate({ quietHoursStart: null, quietHoursEnd: null });

	return {
		clearOverride,
		detectedTimezone,
		disableQuietHours,
		error: query.error,
		isError: query.isError,
		isLoading: query.isPending,
		preferences,
		quietHoursEnabled,
		refetch: query.refetch,
		save,
		setQuietHours,
	};
};
