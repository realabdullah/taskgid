import { useQuery } from "@tanstack/vue-query";
import type { Pagination, Team, Workspace } from "~/types";

export const useWorkspaceStore = defineStore("workspace", () => {
	const workspaceSlug = computed(() => useRoute().params.slug as string);

	const { data: workspace } = useQuery({
		queryKey: ["workspace", workspaceSlug],
		queryFn: async () => {
			return await useApiFetch<Workspace>(`/workspaces/${workspaceSlug.value}`, { method: "GET" });
		},
		enabled: () => !!workspaceSlug.value,
	});

	const { data: teams } = useQuery({
		queryKey: ["workspace-teams", workspaceSlug],
		queryFn: async () => {
			const { success, data } = await useApiFetch<{ success: boolean; data: Team[]; pagination: Pagination }>(`/workspaces/${workspaceSlug.value}/team`);
			if (!data || !success) throw new Error("Failed to fetch workspace teams");
			return data;
		},
	});

	return { workspace, teams };
});
