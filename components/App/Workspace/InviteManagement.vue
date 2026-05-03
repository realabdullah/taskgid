<script lang="ts" setup>
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import type { Pagination, PendingInvitation, Workspace } from "~/types";

const props = defineProps<{ workspace: Workspace }>();

const queryClient = useQueryClient();

const searchQuery = ref("");

const {
	data: invites,
	isFetching,
	isError,
	error,
	refetch,
} = useQuery({
	queryKey: ["pending-invitations"],
	queryFn: async () => {
		const data = await useApiFetch<{ data: PendingInvitation[]; pagination: Pagination }>(API_ENDPOINTS.invites.pending);
		if (!data?.data) throw new Error("Failed to fetch invitations");
		return data.data;
	},
});

const filteredInvites = computed(() => {
	if (!invites.value) return [];
	return invites.value.filter(
		(invite) => !searchQuery.value || invite.token.toLowerCase().includes(searchQuery.value.toLowerCase()) || invite.workspaceTitle.toLowerCase().includes(searchQuery.value.toLowerCase())
	);
});

const acceptMutation = useMutation({
	mutationFn: async (invitation: PendingInvitation) => {
		const response = await useApiFetch<{ success: boolean; error?: string; isNewUser?: boolean; resetToken?: string }>(API_ENDPOINTS.invites.accept, {
			method: "POST",
			body: { token: invitation.token },
		});
		if (!response?.success) throw new Error(response?.error || "Failed to accept invitation");
		return response;
	},
	onSuccess: async (response) => {
		if (response.isNewUser && response.resetToken) {
			toast.success("Invitation accepted. Set your password to continue.");
			await navigateTo(`/reset-confirmation?token=${encodeURIComponent(response.resetToken)}`);
			return;
		}
		toast.success("Invitation accepted successfully");
		queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
		queryClient.invalidateQueries({ queryKey: ["workspaces"] });
	},
	onError: (err) => toast.error(getServerError(err)),
});

const declineMutation = useMutation({
	mutationFn: async (invitation: PendingInvitation) => {
		const response = await useApiFetch<{ success: boolean; error?: string }>(API_ENDPOINTS.invites.decline, {
			method: "POST",
			body: { token: invitation.token },
		});
		if (!response?.success) throw new Error(response?.error || "Failed to decline invitation");
	},
	onSuccess: () => {
		toast.success("Invitation declined");
		queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
		queryClient.invalidateQueries({ queryKey: ["workspaces"] });
	},
	onError: (err) => toast.error(getServerError(err)),
});
</script>

<template>
	<div class="space-y-4">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div class="relative max-w-xs flex-1">
				<Icon name="hugeicons:search-01" :size="16" class="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
				<Input v-model="searchQuery" placeholder="Search by workspace…" class="pl-9" />
			</div>
		</div>

		<div v-if="isFetching" class="space-y-2">
			<Skeleton v-for="i in 4" :key="i" class="h-14 w-full" />
		</div>

		<AppEmptyState
			v-else-if="isError"
			heading="Could not load invitations"
			:body="String(error || 'Please try again.')"
			icon="lucide:alert-circle"
			:action="{ label: 'Retry', onClick: () => refetch(), variant: 'secondary' }"
		/>

		<AppEmptyState
			v-else-if="filteredInvites.length === 0"
			heading="No pending invitations"
			:body="searchQuery ? 'Try a different search term.' : 'You have no pending invitations right now.'"
			icon="hugeicons:mail-send-01"
		/>

		<div v-else class="border-border divide-border divide-y overflow-hidden rounded-md border">
			<div v-for="invite in filteredInvites" :key="invite.invitationId" class="bg-surface-0 flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
				<div class="min-w-0 space-y-1">
					<div class="flex flex-wrap items-center gap-2">
						<p class="text-text-primary truncate text-sm font-medium">{{ invite.workspaceTitle }}</p>
						<span class="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 capitalize">Pending</span>
					</div>
					<p class="text-text-tertiary text-xs">
						Sent by {{ invite.invitedBy.firstName }} {{ invite.invitedBy.lastName }} · {{ getTimeAgo(new Date(invite.invitedAt)) }} · Expires {{ getTimeAgo(new Date(invite.expiresAt)) }}
					</p>
				</div>

				<div class="flex shrink-0 items-center gap-2">
					<Button variant="destructive" size="sm" class="h-8" :disabled="Boolean(acceptMutation.isPending) || Boolean(declineMutation.isPending)" @click="declineMutation.mutate(invite)">
						Decline
					</Button>
					<Button variant="default" size="sm" class="h-8" :disabled="Boolean(acceptMutation.isPending) || Boolean(declineMutation.isPending)" @click="acceptMutation.mutate(invite)">
						Accept
					</Button>
				</div>
			</div>
		</div>
	</div>
</template>
