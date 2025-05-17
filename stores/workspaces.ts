import { useQuery } from "@tanstack/vue-query";
import type { GetWorkspaces } from "~/types";

export const useWorkspacesStore = defineStore("workspaces", () => {
	const { user } = storeToRefs(useStore());
	const { pagination } = usePagination();
	const workspaceType = ref<"all" | "created" | "invited">("all");
	const workspacesCount = ref(0);

	const {
		data: workspaces,
		isFetching,
		refetch,
	} = useQuery({
		queryKey: ["workspaces", workspaceType, pagination, user],
		queryFn: async () => {
			const data = await useApiFetch<GetWorkspaces>("/workspaces", {
				method: "GET",
				params: { type: workspaceType.value, ...pagination.value },
			});
			return { workspaces: data.data, pagination: data.pagination };
		},
		select: ({ workspaces, pagination }) => {
			workspacesCount.value = pagination.total;
			return workspaces;
		},
		enabled: () => !!user.value?.id,
	});

	return { workspaceType, workspaces, pagination, isLoadingWorkspaces: isFetching, getWorkspaces: refetch };
});
