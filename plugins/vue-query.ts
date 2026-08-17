import type { DehydratedState, VueQueryPluginOptions } from "@tanstack/vue-query";
import { VueQueryPlugin, QueryClient, hydrate, dehydrate } from "@tanstack/vue-query";

export default defineNuxtPlugin((nuxt) => {
	const vueQueryState = useState<DehydratedState | null>("vue-query");

	const queryClient = new QueryClient({
		// refetchOnWindowFocus is the correctness floor: when the event stream is
		// unavailable or a tab has been asleep, coming back still reconciles.
		defaultOptions: { queries: { staleTime: 5000, refetchOnWindowFocus: true } },
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
