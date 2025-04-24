import type { GetWorkspaces, Workspace } from "~/types";

export const useWorkspaceStore = defineStore("workspace", () => {
	const { user } = storeToRefs(useStore());
	const { pagination } = usePagination();

	const workspaces = ref<Workspace[]>([]);

	const { refresh } = useAsyncData(
		`${user.value?.id}-workspaces`,
		async () => {
			const data = await useApiFetch<GetWorkspaces>("/workspaces", { method: "GET" });
			return { workspaces: data.data, pagination: data.pagination };
		},
		{
			transform: ({ workspaces: data }) => {
				workspaces.value = [...data];
				return data;
			},
			watch: [user, pagination],
		}
	);

	return { workspaces, getWorkspaces: refresh };
});
