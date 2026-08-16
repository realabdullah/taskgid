<script lang="ts" setup>
import { usePendingInvitations } from "../composables/usePendingInvitations";

const {
	data: pendingInvites,
	isFetching,
	isError: isInvitesError,
	error: invitesError,
	refetch: refetchInvites,
	isReviewOpen,
	inviteCount,
	mutation: invitationActionMutation,
	acceptInvitation,
	declineInvitation,
} = usePendingInvitations();
</script>

<template>
	<section v-if="inviteCount > 0" class="mb-6 space-y-3">
		<div class="border-accent/20 bg-accent-subtle flex items-center justify-between rounded-lg border px-5 py-3">
			<div class="text-accent-text flex items-center gap-2 text-sm">
				<Icon name="hugeicons:inbox" :size="18" />
				<p>
					You have <span class="font-semibold tabular-nums">{{ inviteCount }}</span> pending workspace invitation{{ inviteCount === 1 ? "" : "s" }}.
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
				heading="Unable to load invitations"
				:body="String(invitesError || 'Check your connection and try again.')"
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
