import type { GetWorkspaces, Workspace } from "~/types";

export const useWorkspaceStore = defineStore("workspace", () => {
	const { user } = storeToRefs(useStore());
	const { pagination } = usePagination();

	const workspaceType = ref<"all" | "created" | "invited">("all");
	const workspaces = ref<Workspace[]>([]);

	const { refresh, status } = useAsyncData(
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

	const isLoadingWorkspaces = ref(false);
	let loadingTimer: ReturnType<typeof setTimeout> | null = null;

	watch(status, (newStatus) => {
		if (newStatus === "pending") {
			loadingTimer = setTimeout(() => {
				isLoadingWorkspaces.value = true;
			}, 300);
		} else {
			if (loadingTimer) {
				clearTimeout(loadingTimer);
				loadingTimer = null;
			}
			isLoadingWorkspaces.value = false;
		}
	});

	return { workspaceType, workspaces, pagination, isLoadingWorkspaces, getWorkspaces: refresh };
});
