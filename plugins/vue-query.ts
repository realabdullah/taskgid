import type { DehydratedState, VueQueryPluginOptions } from "@tanstack/vue-query";
import { VueQueryPlugin, QueryClient, hydrate, dehydrate } from "@tanstack/vue-query";

/** Reads the HTTP status off an H3 error, an ofetch `FetchError`, or neither. */
const statusOf = (error: unknown): number | undefined => {
	const candidate = error as { statusCode?: unknown; status?: unknown } | null;
	const status = candidate?.statusCode ?? candidate?.status;
	return typeof status === "number" ? status : undefined;
};

export default defineNuxtPlugin((nuxt) => {
	const vueQueryState = useState<DehydratedState | null>("vue-query");

	const queryClient = new QueryClient({
		// refetchOnWindowFocus is the correctness floor: when the event stream is
		// unavailable or a tab has been asleep, coming back still reconciles.
		defaultOptions: {
			queries: {
				staleTime: 5000,
				refetchOnWindowFocus: true,
				retry: (failureCount, error) => {
					const status = statusOf(error);
					// A 4xx is a verdict about the request — permission, scope or
					// shape — so repeating it unchanged returns the same answer and
					// only delays the error state. 408 and 429 are the exceptions:
					// both invite the same request again.
					if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) return false;
					return failureCount < 3;
				},
			},
		},
	});
	const options: VueQueryPluginOptions = { queryClient };

	nuxt.vueApp.use(VueQueryPlugin, options);

	if (import.meta.server) {
		nuxt.hooks.hook("app:rendered", () => {
			vueQueryState.value = dehydrate(queryClient);
		});
	}

	if (import.meta.client) {
		nuxt.hooks.hook("app:created", () => {
			hydrate(queryClient, vueQueryState.value);
		});
	}
});
