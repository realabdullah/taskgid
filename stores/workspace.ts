import type { GetWorkspaces, Workspace } from "~/types";

export const useWorkspaceStore = defineStore("workspace", () => {
	const { user } = storeToRefs(useStore());
	const { pagination } = usePagination();

	const workspaceType = ref<"all" | "created" | "invited">("all");
	const workspaces = ref<Workspace[]>([]);

	const { refresh } = useAsyncData(
		`${user.value?.id}-workspaces`,
		async () => {
			const data = await useApiFetch<GetWorkspaces>("/workspaces", { method: "GET", params: { type: workspaceType.value, ...pagination.value } });
			return { workspaces: data.data, pagination: data.pagination };
		},
		{
			transform: ({ workspaces: data }) => {
				workspaces.value = [...data];
				return data;
			},
			watch: [workspaceType],
		}
	);

	return { workspaceType, workspaces, pagination, getWorkspaces: refresh };
});
