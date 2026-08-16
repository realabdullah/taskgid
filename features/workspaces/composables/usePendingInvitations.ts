import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import type { Pagination, PendingInvitation } from "~/types";

type InvitationActionResponse = { success: boolean; error?: string; isNewUser?: boolean; resetToken?: string };
type InvitationEndpoint = typeof API_ENDPOINTS.invites.accept | typeof API_ENDPOINTS.invites.decline;

export const usePendingInvitations = () => {
	const queryClient = useQueryClient();
	const isReviewOpen = ref(false);
	const query = useQuery({
		queryKey: ["pending-invitations"],
		queryFn: async () => {
			const response = await useApiFetch<{ data: PendingInvitation[]; pagination: Pagination }>(API_ENDPOINTS.invites.pending);
			if (!response?.data) throw new Error("Unable to load pending invitations. Try again.");
			return response.data;
		},
	});
	const inviteCount = computed(() => query.data.value?.length ?? 0);

	const mutation = useMutation({
		mutationFn: async ({ endpoint, invitation }: { endpoint: InvitationEndpoint; invitation: PendingInvitation }) => {
			const response = await useApiFetch<InvitationActionResponse>(endpoint, { method: "POST", body: { token: invitation.token } });
			if (!response?.success) throw new Error(response?.error || "Unable to update this invitation. Try again.");
			return response;
		},
		onMutate: async ({ invitation }) => {
			await queryClient.cancelQueries({ queryKey: ["pending-invitations"] });
			const previous = queryClient.getQueryData<PendingInvitation[]>(["pending-invitations"]) ?? [];
			queryClient.setQueryData<PendingInvitation[]>(["pending-invitations"], (current = []) => current.filter((item) => item.invitationId !== invitation.invitationId));
			return { previous };
		},
		onError: (error, _, context) => {
			if (context?.previous) queryClient.setQueryData(["pending-invitations"], context.previous);
			toast.error(getServerError(error));
		},
		onSuccess: async (response, { endpoint }) => {
			if (endpoint === API_ENDPOINTS.invites.accept && response.isNewUser && response.resetToken) {
				toast.success("Invitation accepted. Set your password to continue.");
				await navigateTo(`/reset-confirmation?token=${encodeURIComponent(response.resetToken)}`);
				return;
			}
			toast.success(endpoint === API_ENDPOINTS.invites.accept ? "Invitation accepted." : "Invitation declined.");
		},
		onSettled: () => {
			void queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
			void queryClient.invalidateQueries({ queryKey: ["workspaces"] });
		},
	});

	const acceptInvitation = (invitation: PendingInvitation) => mutation.mutate({ endpoint: API_ENDPOINTS.invites.accept, invitation });
	const declineInvitation = (invitation: PendingInvitation) => mutation.mutate({ endpoint: API_ENDPOINTS.invites.decline, invitation });

	return { ...query, inviteCount, isReviewOpen, mutation, acceptInvitation, declineInvitation };
};
