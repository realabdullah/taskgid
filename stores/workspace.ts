import { useQuery } from "@tanstack/vue-query";
import type { Workspace } from "~/types";

export const useWorkspaceStore = defineStore("workspace", () => {
	const workspaceSlug = computed(() => useRoute().params.slug as string);

	const { data: workspace } = useQuery({
		queryKey: ["workspace", workspaceSlug],
		queryFn: async () => {
			return await useApiFetch<Workspace>(`/workspaces/${workspaceSlug.value}`, { method: "GET" });
		},
		enabled: () => !!workspaceSlug.value,
	});

	return { workspace };
});
