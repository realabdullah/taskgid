<script lang="ts" setup>
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import type { Pagination, PendingInvitation } from "~/types";
import { useApiFetch } from "../../composables/useApiFetch";

const queryClient = useQueryClient();
const isReviewOpen = ref(false);

const {
	data: pendingInvites,
	isFetching,
	isError: isInvitesError,
	error: invitesError,
	refetch: refetchInvites,
} = useQuery({
	queryKey: ["pending-invitations"],
	queryFn: async () => {
		const data = await useApiFetch<{ data: PendingInvitation[]; pagination: Pagination }>(API_ENDPOINTS.invites.pending);
		if (!data?.data) {
			throw new Error("Failed to fetch pending invitations");
		}
		return data.data;
	},
});

const inviteCount = computed(() => pendingInvites.value?.length ?? 0);
type InvitationEndpoint = typeof API_ENDPOINTS.invites.accept | typeof API_ENDPOINTS.invites.decline;

type MutationContext = {
	previousInvites: PendingInvitation[];
};

const invitationActionMutation = useMutation({
	mutationFn: async ({ endpoint, invitation }: { endpoint: InvitationEndpoint; invitation: PendingInvitation }) => {
		const response = await useApiFetch<{ success: boolean; message?: string; error?: string }>(endpoint, {
			method: "POST",
			body: { token: invitation.token },
		});

		if (!response?.success) {
			throw new Error(response?.error || "Invitation action failed");
		}

		return response;
	},
	onMutate: async ({ invitation }): Promise<MutationContext> => {
		await queryClient.cancelQueries({ queryKey: ["pending-invitations"] });
		const previousInvites = queryClient.getQueryData<PendingInvitation[]>(["pending-invitations"]) ?? [];

		queryClient.setQueryData<PendingInvitation[]>(["pending-invitations"], (current = []) => current.filter((item) => item.invitationId !== invitation.invitationId));

		return { previousInvites };
	},
	onError: (error, _, context) => {
		if (context?.previousInvites) {
			queryClient.setQueryData(["pending-invitations"], context.previousInvites);
		}
		toast.error(getServerError(error));
	},
	onSuccess: (_, variables) => {
		if (variables.endpoint === API_ENDPOINTS.invites.accept) {
			toast.success("Invitation accepted successfully");
		} else {
			toast.success("Invitation declined");
		}
	},
	onSettled: () => {
		queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
		queryClient.invalidateQueries({ queryKey: ["workspaces"] });
	},
});

const acceptInvitation = (invitation: PendingInvitation) => {
	invitationActionMutation.mutate({ endpoint: API_ENDPOINTS.invites.accept, invitation });
};

const declineInvitation = (invitation: PendingInvitation) => {
	invitationActionMutation.mutate({ endpoint: API_ENDPOINTS.invites.decline, invitation });
};
</script>

<template>
	<section v-if="inviteCount > 0" class="mb-6 space-y-3">
		<div class="border-accent/20 bg-accent-subtle flex items-center justify-between rounded-lg border px-5 py-3">
			<div class="text-accent-text flex items-center gap-2 text-sm">
				<Icon name="hugeicons:inbox" :size="18" />
				<p>
					You have <span class="font-semibold">{{ inviteCount }}</span> pending workspace invitation{{ inviteCount > 1 ? "s" : "" }}.
				</p>
			</div>
			<Button variant="secondary" size="sm" class="h-8" @click="isReviewOpen = !isReviewOpen">
				{{ isReviewOpen ? "Hide invites" : "Review invites" }}
			</Button>
		</div>

		<div v-if="isReviewOpen" class="border-border bg-surface-0 space-y-3 rounded-lg border p-4">
			<div v-if="isFetching" class="space-y-2">
				<Skeleton class="h-16 w-full" />
				<Skeleton class="h-16 w-full" />
			</div>

			<AppEmptyState
				v-else-if="isInvitesError"
				heading="Could not load invitations"
				:body="String(invitesError || 'Please try again.')"
				icon="lucide:alert-circle"
				:action="{ label: 'Retry', onClick: () => refetchInvites(), variant: 'secondary' }"
			/>

			<div
				v-for="invitation in pendingInvites"
				v-else
				:key="invitation.invitationId"
				class="border-border bg-surface-0 flex flex-col justify-between gap-3 rounded-lg border px-4 py-3 md:flex-row md:items-center"
			>
				<div class="space-y-1">
					<p class="text-text-primary text-sm font-semibold">{{ invitation.workspaceTitle }}</p>
					<p class="text-text-secondary text-sm">{{ invitation.workspaceDescription }}</p>
					<p class="text-text-tertiary text-xs">Invited by {{ invitation.invitedBy.firstName }} {{ invitation.invitedBy.lastName }} · {{ getTimeAgo(new Date(invitation.invitedAt)) }}</p>
				</div>

				<div class="flex items-center gap-2">
					<Button variant="destructive" size="sm" class="h-8" :disabled="Boolean(invitationActionMutation.isPending)" @click="declineInvitation(invitation)"> Decline </Button>
					<Button size="sm" class="h-8" :disabled="Boolean(invitationActionMutation.isPending)" @click="acceptInvitation(invitation)"> Accept </Button>
				</div>
			</div>
		</div>
	</section>
</template>
