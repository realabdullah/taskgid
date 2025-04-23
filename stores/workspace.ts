import type { Pagination, GetWorkspaces, Workspace } from "~/types";

export const useWorkspaceStore = defineStore("workspace", () => {
	const workspaces = ref<Workspace[]>([]);
	const workspacePagination = ref<Pagination>();

	const mergeById = (incoming: Workspace[]) => {
		const map = new Map();
		for (const item of [...workspaces.value, ...incoming]) {
			map.set(item.id, item);
		}
		return Array.from(map.values());
	};

	const getWorkspaces = async () => {
		try {
			const { data, pagination } = await useApiFetch<GetWorkspaces>("/workspaces", { method: "GET" });
			workspaces.value = mergeById(data);
			workspacePagination.value = { ...pagination };
		} catch (error) {
			throw createError({
				statusMessage: String(error),
				fatal: true,
			});
		}
	};

	return { workspaces, workspacePagination, getWorkspaces };
});
