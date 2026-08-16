import { Novu, type NovuOptions, type Subscriber } from "@novu/js";
import { NovuUI, type InboxPage } from "@novu/js/ui";
import { storeToRefs } from "pinia";
import { useStore } from "~/stores";
import { notificationAppearance } from "../notificationAppearance";

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const unwrapNovuResult = async <T>(value: unknown): Promise<T | null> => {
	const resolved = await Promise.resolve(value);
	if (isRecord(resolved)) {
		if ("error" in resolved && resolved.error) throw resolved.error;
		if ("data" in resolved) return (resolved.data as T | undefined) ?? null;
		if ("result" in resolved) return (resolved.result as T | undefined) ?? null;
	}
	return (resolved as T | null) ?? null;
};

const extractUnreadTotal = (value: unknown): number => {
	if (typeof value === "number") return value;
	if (!isRecord(value)) return 0;
	if (typeof value.total === "number") return value.total;
	if (typeof value.count === "number") return value.count;
	if ("unreadCount" in value) return extractUnreadTotal(value.unreadCount);
	if ("data" in value) return extractUnreadTotal(value.data);
	if ("result" in value) return extractUnreadTotal(value.result);
	return 0;
};

export const useNotificationInbox = () => {
	const { user } = storeToRefs(useStore());
	const router = useRouter();
	const open = ref(false);
	const unreadCount = ref(0);
	const mountError = ref<string | null>(null);
	const inboxMountTarget = ref<HTMLDivElement | null>(null);
	let novu: Novu | null = null;
	let novuUi: NovuUI | null = null;
	let removeUnreadListener: (() => void) | null = null;
	let removeSessionListener: (() => void) | null = null;
	let removeReceivedListener: (() => void) | null = null;

	const fallbackSubscriberId = import.meta.env.VITE_DEFAULT_SUBSCRIBER_ID;
	const hasApplicationIdentifier = computed(() => Boolean(import.meta.env.VITE_NOVU_APPLICATION_IDENTIFIER));
	const missingConfigurationHeading = computed(() => (import.meta.dev ? "Notifications need setup" : "Notifications unavailable"));
	const missingConfigurationBody = computed(() =>
		import.meta.dev
			? "Notifications will appear here after NUXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER is configured for this local environment."
			: "Notifications are unavailable right now. Try again later."
	);
	const inboxErrorBody = computed(() => (import.meta.dev && mountError.value ? mountError.value : "Check your connection and try again."));
	const subscriber = computed<Subscriber>(() => ({
		subscriberId: user.value?.id || fallbackSubscriberId,
		firstName: user.value?.firstName,
		lastName: user.value?.lastName,
		email: user.value?.email,
		avatar: user.value?.profilePicture,
	}));
	const novuOptions = computed<NovuOptions | null>(() => {
		if (!hasApplicationIdentifier.value) return null;
		return {
			applicationIdentifier: import.meta.env.VITE_NOVU_APPLICATION_IDENTIFIER,
			subscriber: subscriber.value,
			...(import.meta.env.VITE_NOVU_BACKEND_URL ? { backendUrl: import.meta.env.VITE_NOVU_BACKEND_URL } : {}),
			...(import.meta.env.VITE_NOVU_SOCKET_URL ? { socketUrl: import.meta.env.VITE_NOVU_SOCKET_URL } : {}),
		};
	});
	const novuOptionsKey = computed(() =>
		novuOptions.value
			? JSON.stringify({
					applicationIdentifier: novuOptions.value.applicationIdentifier,
					subscriberId: subscriber.value.subscriberId,
					backendUrl: import.meta.env.VITE_NOVU_BACKEND_URL,
					socketUrl: import.meta.env.VITE_NOVU_SOCKET_URL,
				})
			: ""
	);

	const clearMountedInbox = () => {
		novuUi?.unmount();
		novuUi = null;
		if (inboxMountTarget.value) inboxMountTarget.value.innerHTML = "";
	};
	const clearListeners = () => {
		removeUnreadListener?.();
		removeSessionListener?.();
		removeReceivedListener?.();
		removeUnreadListener = removeSessionListener = removeReceivedListener = null;
		if (novu) void Promise.resolve(novu.socket.disconnect()).catch(() => undefined);
		novu = null;
	};
	const syncUnreadCount = async (instance: Novu) => {
		try {
			unreadCount.value = extractUnreadTotal(await unwrapNovuResult(instance.notifications.count({ read: false, archived: false })));
		} catch {
			unreadCount.value = 0;
		}
	};
	const mountInbox = async () => {
		if (!novu || !novuOptions.value || !open.value) return;
		await nextTick();
		if (!inboxMountTarget.value) return;
		try {
			clearMountedInbox();
			novuUi = new NovuUI({
				novu,
				options: novuOptions.value,
				appearance: notificationAppearance,
				routerPush: (path) => (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith("mailto:") ? window.location.assign(path) : router.push(path)),
			});
			novuUi.mountComponent({ name: "InboxContent", element: inboxMountTarget.value, props: { initialPage: "notifications" as InboxPage } });
		} catch (error) {
			mountError.value = getServerError(error, "Notifications are currently unavailable.");
			clearMountedInbox();
		}
	};
	const ensureNovu = async () => {
		clearMountedInbox();
		clearListeners();
		mountError.value = null;
		if (!novuOptions.value) {
			unreadCount.value = 0;
			return;
		}
		try {
			const instance = new Novu(novuOptions.value);
			novu = instance;
			removeUnreadListener = instance.on("notifications.unread_count_changed", (payload) => (unreadCount.value = extractUnreadTotal(payload)));
			removeSessionListener = instance.on("session.initialize.resolved", (payload) => (unreadCount.value = extractUnreadTotal(payload)));
			removeReceivedListener = instance.on("notifications.notification_received", () => void syncUnreadCount(instance));
			await Promise.resolve(instance.socket.connect());
			await syncUnreadCount(instance);
			if (open.value) await mountInbox();
		} catch (error) {
			mountError.value = getServerError(error, "Notifications are currently unavailable.");
			clearListeners();
		}
	};

	watch(novuOptionsKey, () => void ensureNovu(), { immediate: true });
	watch(open, (isOpen) => (isOpen ? void mountInbox() : clearMountedInbox()));
	onBeforeUnmount(() => {
		clearMountedInbox();
		clearListeners();
	});

	return { open, unreadCount, mountError, inboxMountTarget, hasApplicationIdentifier, missingConfigurationHeading, missingConfigurationBody, inboxErrorBody };
};
