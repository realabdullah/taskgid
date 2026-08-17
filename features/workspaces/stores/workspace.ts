import { useQuery } from "@tanstack/vue-query";
import type { Team, Workspace } from "~/types";

export const useWorkspaceStore = defineStore("workspace", () => {
	const workspaceSlug = computed(() => {
		const slug = useRoute().params.slug;
		return typeof slug === "string" ? slug : "";
	});

	const { data: workspace } = useQuery({
		queryKey: ["workspace", workspaceSlug],
		queryFn: async () => {
			return await useApiFetch<Workspace>(API_ENDPOINTS.workspaces.bySlug(workspaceSlug.value), { method: "GET" });
		},
		enabled: () => !!workspaceSlug.value,
	});

	const { data: teams } = useQuery({
		queryKey: ["workspace-teams", workspaceSlug],
		queryFn: async () => {
			const { data } = await fetchAllPages<Team>(API_ENDPOINTS.workspaces.team(workspaceSlug.value));
			return data;
		},
		enabled: () => !!workspaceSlug.value,
	});

	return { workspace, teams };
});
