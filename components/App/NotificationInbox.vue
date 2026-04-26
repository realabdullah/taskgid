<script lang="ts" setup>
import { Novu, type NovuOptions, type Subscriber } from "@novu/js"
import { NovuUI, type InboxAppearance } from "@novu/js/ui"
import { storeToRefs } from "pinia"
import { useStore } from "~/stores"

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
		: "Notifications are not available right now. Please try again later."
);
const inboxErrorBody = computed(() => (import.meta.dev && mountError.value ? mountError.value : "We couldn't load your notifications right now. Please try again in a moment."));

const subscriber = computed<Subscriber>(() => ({
	subscriberId: user.value?.id || fallbackSubscriberId,
	firstName: user.value?.firstName,
	lastName: user.value?.lastName,
	email: user.value?.email,
	avatar: user.value?.profilePicture,
}));

const novuOptions = computed<NovuOptions | null>(() => {
	if (!hasApplicationIdentifier.value) {
		return null;
	}

	return {
		applicationIdentifier: import.meta.env.VITE_NOVU_APPLICATION_IDENTIFIER,
		subscriber: subscriber.value,
		...(import.meta.env.VITE_NOVU_BACKEND_URL ? { backendUrl: import.meta.env.VITE_NOVU_BACKEND_URL } : {}),
		...(import.meta.env.VITE_NOVU_SOCKET_URL ? { socketUrl: import.meta.env.VITE_NOVU_SOCKET_URL } : {}),
	};
});

const novuOptionsKey = computed(() => {
	if (!novuOptions.value) {
		return "";
	}

	return JSON.stringify({
		applicationIdentifier: novuOptions.value.applicationIdentifier,
		subscriberId: subscriber.value.subscriberId,
		backendUrl: import.meta.env.VITE_NOVU_BACKEND_URL,
		socketUrl: import.meta.env.VITE_NOVU_SOCKET_URL,
	});
});

const appearance = computed<InboxAppearance>(() => ({
	variables: {
		colorBackground: "var(--color-surface-0)",
		colorForeground: "var(--color-text-primary)",
		colorPrimary: "var(--color-accent)",
		colorPrimaryForeground: "#ffffff",
		colorSecondary: "var(--color-surface-2)",
		colorSecondaryForeground: "var(--color-text-primary)",
		colorCounter: "var(--color-danger)",
		colorCounterForeground: "#ffffff",
		colorNeutral: "var(--color-border)",
		colorShadow: "var(--shadow-premium)",
		colorRing: "var(--color-brand-focus)",
		fontSize: "14px",
		borderRadius: "var(--radius-lg)",
		colorSeverityHigh: "var(--color-danger)",
		colorSeverityMedium: "var(--color-warning)",
		colorSeverityLow: "var(--color-info)",
	},
	elements: {
		root: {
			fontFamily: "Geist, Inter, sans-serif",
		},
		inboxContent: {
			backgroundColor: "var(--color-surface-0)",
		},
		notificationListContainer: {
			padding: "12px",
			gap: "12px",
		},
		notificationList: {
			gap: "12px",
		},
		notification: {
			backgroundColor: "var(--color-surface-0)",
			border: "1px solid var(--color-border)",
			borderRadius: "var(--radius-lg)",
			boxShadow: "var(--shadow-xs)",
		},
		notificationBar: {
			backgroundColor: "var(--color-accent)",
			borderRadius: "9999px",
		},
		notificationSubject: {
			color: "var(--color-text-primary)",
			fontWeight: 600,
		},
		notificationBody: {
			color: "var(--color-text-secondary)",
		},
		notificationDate: {
			color: "var(--color-text-tertiary)",
			fontSize: "12px",
		},
		notificationDot: {
			backgroundColor: "var(--color-danger)",
		},
		notificationPrimaryAction__button: {
			backgroundColor: "var(--color-accent)",
			color: "#ffffff",
			borderRadius: "var(--radius-md)",
		},
		notificationSecondaryAction__button: {
			backgroundColor: "var(--color-surface-2)",
			color: "var(--color-text-primary)",
			borderRadius: "var(--radius-md)",
		},
		notificationRead__button: {
			color: "var(--color-text-secondary)",
		},
		notificationArchive__button: {
			color: "var(--color-text-secondary)",
		},
		tabsList: {
			backgroundColor: "var(--color-surface-1)",
			borderBottom: "1px solid var(--color-border)",
			padding: "8px 12px",
		},
		tabsTrigger: {
			borderRadius: "var(--radius-full)",
			color: "var(--color-text-secondary)",
		},
		preferencesContainer: {
			padding: "12px",
		},
		scheduleContainer: {
			border: "1px solid var(--color-border)",
			borderRadius: "var(--radius-lg)",
			backgroundColor: "var(--color-surface-0)",
		},
	},
}));

const getDisplayError = (error: unknown) => getServerError(error, "Notifications are currently unavailable.");

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const unwrapNovuResult = async <T>(value: unknown): Promise<T | null> => {
	const resolved = await Promise.resolve(value);

	if (isRecord(resolved)) {
		if ("error" in resolved && resolved.error) {
			throw resolved.error;
		}

		if ("data" in resolved) {
			return (resolved.data as T | undefined) ?? null;
		}

		if ("result" in resolved) {
			return (resolved.result as T | undefined) ?? null;
		}
	}

	return (resolved as T | null) ?? null;
};

const extractUnreadTotal = (value: unknown): number => {
	if (typeof value === "number") {
		return value;
	}

	if (!isRecord(value)) {
		return 0;
	}

	if (typeof value.total === "number") {
		return value.total;
	}

	if (typeof value.count === "number") {
		return value.count;
	}

	if ("unreadCount" in value) {
		return extractUnreadTotal(value.unreadCount);
	}

	if ("data" in value) {
		return extractUnreadTotal(value.data);
	}

	if ("result" in value) {
		return extractUnreadTotal(value.result);
	}

	return 0;
};

const clearMountedInbox = () => {
	if (novuUi) {
		novuUi.unmount();
		novuUi = null;
	}

	if (inboxMountTarget.value) {
		inboxMountTarget.value.innerHTML = "";
	}
};

const clearNovuListeners = () => {
	removeUnreadListener?.();
	removeUnreadListener = null;
	removeSessionListener?.();
	removeSessionListener = null;
	removeReceivedListener?.();
	removeReceivedListener = null;
	if (novu) {
		void Promise.resolve(novu.socket.disconnect()).catch(() => undefined);
		novu = null;
	}
};

const syncUnreadCount = async (instance: Novu) => {
	try {
		const count = await unwrapNovuResult(instance.notifications.count({ read: false, archived: false }));
		unreadCount.value = extractUnreadTotal(count);
	} catch {
		unreadCount.value = 0;
	}
};

const handleRouterPush = (path: string) => {
	if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith("mailto:")) {
		window.location.assign(path);
		return;
	}

	router.push(path);
};

const ensureNovu = async () => {
	clearMountedInbox();
	clearNovuListeners();
	mountError.value = null;

	if (!novuOptions.value) {
		unreadCount.value = 0;
		return;
	}

	try {
		const instance = new Novu(novuOptions.value);
		novu = instance;

		removeUnreadListener = instance.on("notifications.unread_count_changed", (payload) => {
			unreadCount.value = extractUnreadTotal(payload);
		});

		removeSessionListener = instance.on("session.initialize.resolved", (payload) => {
			unreadCount.value = extractUnreadTotal(payload);
		});

		removeReceivedListener = instance.on("notifications.notification_received", async () => {
			await syncUnreadCount(instance);
		});

		await Promise.resolve(instance.socket.connect());
		await syncUnreadCount(instance);

		if (open.value) {
			await nextTick();
			await mountInbox();
		}
	} catch (error) {
		mountError.value = getDisplayError(error);
		clearNovuListeners();
	}
};

const mountInbox = async () => {
	if (!novu || !novuOptions.value || !open.value) {
		return;
	}

	await nextTick();

	if (!inboxMountTarget.value) {
		return;
	}

	try {
		clearMountedInbox();
		const ui = new NovuUI({
			novu,
			options: novuOptions.value,
			appearance: appearance.value,
			routerPush: handleRouterPush,
		});

		novuUi = ui;
		ui.mountComponent({
			name: "InboxContent",
			element: inboxMountTarget.value,
			props: {
				initialPage: "notifications",
			},
		});
	} catch (error) {
		mountError.value = getDisplayError(error);
		clearMountedInbox();
	}
};

watch(
	() => novuOptionsKey.value,
	() => {
		void ensureNovu();
	},
	{ immediate: true }
);

watch(open, (isOpen) => {
	if (!isOpen) {
		clearMountedInbox();
		return;
	}

	void mountInbox();
});

watch(appearance, (nextAppearance) => {
	if (novuUi) {
		novuUi.updateAppearance(nextAppearance);
	}
});

onBeforeUnmount(() => {
	clearMountedInbox();
	clearNovuListeners();
});
</script>

<template>
	<Popover v-model:open="open">
		<PopoverTrigger as-child>
			<Button variant="ghost" size="icon" class="relative h-9 w-9 shrink-0" aria-label="Open notifications">
				<Icon name="hugeicons:notification-02" :size="18" />
				<span v-if="unreadCount > 0 && unreadCount <= 9" class="bg-danger absolute top-2 right-2 h-2 w-2 rounded-full" />
				<span v-else-if="unreadCount > 9" class="bg-danger text-2xs absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-medium text-white">
					{{ unreadCount }}
				</span>
			</Button>
		</PopoverTrigger>
		<PopoverContent align="end" class="border-border bg-surface-0 w-[360px] border p-0">
			<AppEmptyState
				v-if="!hasApplicationIdentifier"
				:heading="missingConfigurationHeading"
				:body="missingConfigurationBody"
				icon="lucide:bell-off"
			/>
			<AppEmptyState
				v-else-if="mountError"
				heading="Could not load notifications"
				:body="inboxErrorBody"
				icon="lucide:alert-circle"
			/>
			<div v-else ref="inboxMountTarget" class="min-h-[340px]" />
		</PopoverContent>
	</Popover>
</template>
