import { useQuery } from "@tanstack/vue-query";
import type { Pagination, Team } from "~/types";

export const getWorkspaceTeams = async (slug: string) => {
	return useQuery({
		queryKey: ["workspace-teams", slug],
		queryFn: async () => {
			const { success, data } = await useApiFetch<{ success: boolean; data: Team[]; pagination: Pagination }>(`/workspaces/${slug}/team`);
			if (!data || !success) throw new Error("Failed to fetch workspace teams");
			return data;
		},
	});
};
