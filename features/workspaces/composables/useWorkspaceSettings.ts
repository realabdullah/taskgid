import { useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import { useWorkspaceStore } from "~/features/workspaces/stores/workspace";

export const useWorkspaceSettings = () => {
	const route = useRoute();
	const queryClient = useQueryClient();
	const { workspace } = storeToRefs(useWorkspaceStore());
	const isInviteOpen = ref(false);
	const isSaving = ref(false);
	const draft = reactive({ title: "", description: "", slug: "" });

	watch(
		workspace,
		(value) => {
			if (value) Object.assign(draft, { title: value.title, description: value.description ?? "", slug: value.slug });
		},
		{ immediate: true }
	);

	const hasChanges = computed(
		() => Boolean(workspace.value) && (draft.title !== workspace.value?.title || draft.description !== (workspace.value?.description ?? "") || draft.slug !== workspace.value?.slug)
	);
	const resetWorkspace = () => {
		if (workspace.value) Object.assign(draft, { title: workspace.value.title, description: workspace.value.description ?? "", slug: workspace.value.slug });
	};
	const saveWorkspace = async () => {
		if (!workspace.value || !draft.title.trim() || !draft.slug.trim()) return;
		try {
			isSaving.value = true;
			const { workspace: updated } = await useApiFetch<{ workspace: typeof workspace.value }>(API_ENDPOINTS.workspaces.bySlug(workspace.value.slug), {
				method: "PUT",
				body: { title: draft.title.trim(), description: draft.description.trim(), slug: draft.slug.trim() },
			});
			if (!updated) throw new Error("Unable to update the workspace. Try again.");
			await Promise.all([queryClient.invalidateQueries({ queryKey: ["workspace"] }), queryClient.invalidateQueries({ queryKey: ["workspaces"] })]);
			toast.success("Workspace updated.");
			if (updated.slug !== String(route.params.slug)) await navigateTo(`/app/workspaces/${updated.slug}/settings`, { replace: true });
		} catch (error) {
			toast.error(getServerError(error));
		} finally {
			isSaving.value = false;
		}
	};

	return { draft, hasChanges, isInviteOpen, isSaving, resetWorkspace, route, saveWorkspace, workspace };
};
