export const useWorkspace = () => {
	const { $axios } = useNuxtApp();
	const { workspaces, currentWorkspace } = storeToRefs(useStore());
	const selectedWorkspaceSlug = ref("");

	const getWorkspaces = async () => {
		try {
			const { data } = await $axios.get("/workspaces");
			workspaces.value = data.workspaces;
		} catch (error) {
			const { code, message } = formatError(error);
			throw createError({
				statusCode: code,
				statusMessage: message,
			});
		}
	};

	const getWorkspace = async (slug: string) => {
		try {
			const { data } = await $axios.get(`/workspaces/${slug}`);
			if (!data.success) throw new Error("Something went wrong");
			currentWorkspace.value = data.workspace;
		} catch (error) {
			const { code, message } = formatError(error);
			throw createError({
				statusCode: code,
				statusMessage: message,
			});
		}
	};

	const createWorkspace = async (workspace: any, usage = "create") => {
		if (usage === "create") {
			const { data } = await $axios.post("/workspaces", workspace);
			workspaces.value.push(data.workspace);
		} else {
			const { data } = await $axios.put(`/workspaces/${selectedWorkspaceSlug.value}`, workspace);
			const index = workspaces.value.findIndex((w: any) => w.slug === selectedWorkspaceSlug.value);
			workspaces.value[index] = data.workspace;
			selectedWorkspaceSlug.value = "";
		}
	};

	const deleteWorkspace = async (slug: string) => {
		const { data } = await $axios.delete(`/workspaces/${slug}`);
		if (!data.success) throw new Error("Something went wrong");
		const index = workspaces.value.findIndex((w: any) => w.slug === slug);
		workspaces.value.splice(index, 1);
	};

	return {
		getWorkspace,
		getWorkspaces,
		createWorkspace,
		deleteWorkspace,
		selectedWorkspaceSlug,
	};
};
