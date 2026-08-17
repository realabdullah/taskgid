/**
 * The client half of the workspace event stream.
 *
 * EventSource cannot send an Authorization header, and putting a JWT in a query
 * string would leak it into proxy and server logs — so the stream is read with
 * `fetch` and a ReadableStream instead, which keeps the token in a header.
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

type RealtimeStatus = "idle" | "connecting" | "open" | "reconnecting" | "closed";

/** Reconnect backoff, in milliseconds, capped at the last value. */
const BACKOFF_MS = [1000, 2000, 5000, 10000, 30000];

/** How many event ids to remember for de-duplication. */
const SEEN_LIMIT = 200;

export const useRealtime = (workspaceSlug: MaybeRefOrGetter<string>, onEvent: (event: WorkspaceEvent) => void) => {
	const config = useRuntimeConfig();
	const authToken = useCookie<string | undefined>("TG-AUTHTOKEN");
	const slug = computed(() => toValue(workspaceSlug));
	const status = ref<RealtimeStatus>("idle");

	let controller: AbortController | undefined;
	let retryTimer: ReturnType<typeof setTimeout> | undefined;
	let attempt = 0;
	let stopped = false;

	// The same event can arrive twice across a reconnect; ids make that harmless.
	const seen = new Set<string>();
	const remember = (eventId: string) => {
		if (seen.has(eventId)) return false;
		seen.add(eventId);
		if (seen.size > SEEN_LIMIT) seen.delete(seen.values().next().value as string);
		return true;
	};

	const handleFrame = (frame: string) => {
		const type = frame.match(/^event: (.+)$/m)?.[1];
		const raw = frame.match(/^data: (.+)$/m)?.[1];
		if (!type || type === "connected" || !raw) return;

		let event: WorkspaceEvent;
		try {
			event = JSON.parse(raw) as WorkspaceEvent;
		} catch {
			return;
		}
		if (!remember(event.eventId)) return;
		onEvent(event);
	};

	const scheduleRetry = () => {
		if (stopped) return;
		status.value = "reconnecting";
		const delay = BACKOFF_MS[Math.min(attempt, BACKOFF_MS.length - 1)];
		attempt += 1;
		retryTimer = setTimeout(() => void connect(), delay);
	};

	const connect = async () => {
		if (stopped || !slug.value || !authToken.value) return;

		controller?.abort();
		controller = new AbortController();
		status.value = attempt === 0 ? "connecting" : "reconnecting";

		try {
			const response = await fetch(`${config.public.apiBaseUrl}${API_ENDPOINTS.workspaces.events(slug.value)}`, {
				headers: { Accept: "text/event-stream", Authorization: `Bearer ${authToken.value}`, "ngrok-skip-browser-warning": "ignore" },
				signal: controller.signal,
			});

			// A 401 or 403 will not fix itself by retrying, so the stream stops and
			// the app falls back to refetch-on-focus.
			if (response.status === 401 || response.status === 403) {
				status.value = "closed";
				return;
			}
			if (!response.ok || !response.body) throw new Error(`stream failed: ${response.status}`);

			status.value = "open";
			attempt = 0;

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = "";

			while (!stopped) {
				const { done, value } = await reader.read();
				if (done) break;
				buffer += decoder.decode(value, { stream: true });

				let boundary = buffer.indexOf("\n\n");
				while (boundary !== -1) {
					handleFrame(buffer.slice(0, boundary));
					buffer = buffer.slice(boundary + 2);
					boundary = buffer.indexOf("\n\n");
				}
			}
			if (!stopped) scheduleRetry();
		} catch (error) {
			if ((error as Error)?.name === "AbortError") return;
			scheduleRetry();
		}
	};

	const stop = () => {
		stopped = true;
		clearTimeout(retryTimer);
		controller?.abort();
		controller = undefined;
		status.value = "closed";
	};

	const start = () => {
		stopped = false;
		attempt = 0;
		void connect();
	};

	// Switching workspaces closes the old stream before opening the new one.
	watch(slug, () => {
		clearTimeout(retryTimer);
		controller?.abort();
		attempt = 0;
		if (slug.value) void connect();
	});

	onMounted(start);
	onBeforeUnmount(stop);

	return { status, start, stop };
};
