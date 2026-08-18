import Pusher, { type Channel } from "pusher-js";

/**
 * The client half of workspace realtime.
 *
 * The persistent connection lives on Pusher rather than in our own API, which
 * is what makes this work on serverless: the server only makes a stateless HTTP
 * call to publish. Subscription is authorised by our `/api/pusher/auth`, so the
 * membership check stays ours.
 *
 * With no Pusher key configured this does nothing at all, and the app falls
 * back to refetch-on-window-focus. Realtime is an enhancement, never a
 * correctness requirement.
 */
export type WorkspaceEventType = "task.created" | "task.updated" | "task.deleted" | "comment.created";

export type WorkspaceEvent = {
	eventId: string;
	type: WorkspaceEventType;
	actorId: string | null;
	workspaceId: string;
	at: string;
	payload: Record<string, unknown>;
};

const EVENT_TYPES: WorkspaceEventType[] = ["task.created", "task.updated", "task.deleted", "comment.created"];

/** How many event ids to remember, so a redelivery is not applied twice. */
const SEEN_LIMIT = 200;

/** One connection per tab, shared across workspace switches. */
let sharedClient: Pusher | null = null;

const getClient = (key: string, cluster: string, authEndpoint: string, token: () => string | undefined) => {
	if (sharedClient) return sharedClient;

	sharedClient = new Pusher(key, {
		cluster,
		channelAuthorization: {
			endpoint: authEndpoint,
			transport: "ajax",
			// The JWT travels in a header, never a query string, so it stays out
			// of proxy and server logs.
			headersProvider: () => {
				const value = token();
				return value ? { Authorization: `Bearer ${value}` } : {};
			},
		},
	});
	return sharedClient;
};

export const useRealtime = (workspaceId: MaybeRefOrGetter<string | undefined>, onEvent: (event: WorkspaceEvent) => void) => {
	const config = useRuntimeConfig();
	const authToken = useCookie<string | undefined>("TG-AUTHTOKEN");
	const id = computed(() => toValue(workspaceId) || "");

	const status = ref<"disabled" | "idle" | "connecting" | "open" | "error">("idle");
	const seen = new Set<string>();
	let channel: Channel | undefined;

	const pusherKey = String(config.public.pusherKey || "");
	const pusherCluster = String(config.public.pusherCluster || "");
	const isEnabled = Boolean(pusherKey && pusherCluster);

	const remember = (eventId: string) => {
		if (seen.has(eventId)) return false;
		seen.add(eventId);
		if (seen.size > SEEN_LIMIT) seen.delete(seen.values().next().value as string);
		return true;
	};

	const unsubscribe = () => {
		if (!channel) return;
		channel.unbind_all();
		sharedClient?.unsubscribe(channel.name);
		channel = undefined;
	};

	const subscribe = () => {
		if (!isEnabled || !id.value || !authToken.value) return;

		const client = getClient(pusherKey, pusherCluster, `${config.public.apiBaseUrl}${API_ENDPOINTS.pusher.auth}`, () => authToken.value);
		status.value = "connecting";

		channel = client.subscribe(`private-workspace-${id.value}`);
		channel.bind("pusher:subscription_succeeded", () => (status.value = "open"));
		channel.bind("pusher:subscription_error", () => (status.value = "error"));

		for (const type of EVENT_TYPES) {
			channel.bind(type, (event: WorkspaceEvent) => {
				if (!event?.eventId || !remember(event.eventId)) return;
				onEvent(event);
			});
		}
	};

	// Switching workspaces leaves the old channel before joining the new one, so
	// a user never keeps receiving events for a workspace they have left.
	watch(id, () => {
		unsubscribe();
		subscribe();
	});

	onMounted(() => {
		if (!isEnabled) {
			status.value = "disabled";
			return;
		}
		subscribe();
	});
	onBeforeUnmount(unsubscribe);

	return { status, isEnabled };
};
