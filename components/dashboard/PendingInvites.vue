<script lang="ts" setup>
import { formatTimeAgo } from "@vueuse/core";
import { toast } from "vue-sonner";
import type { Pagination, PendingInvitation } from "~/types";

const { user } = storeToRefs(useStore());

const { data } = useAsyncData("pending-invitations", async () => {
	const data = await useApiFetch<{ data: PendingInvitation[]; pagination: Pagination }>("/invite/pending");
	return { invitations: data.data, pagination: data.pagination };
});

const inProgressId = ref<string | null>(null);
const isLoading = computed(() => inProgressId.value !== null);
const acceptInvitation = async (invitation: PendingInvitation) => {
	try {
		inProgressId.value = invitation.invitationId;
		const res = await useApiFetch<{ success: boolean; message: string; error?: string; isNewUser: boolean }>("/invite/accept", {
			method: "POST",
			body: { token: invitation.token },
		});

		if (!res || !res.success) throw new Error(res?.message || res?.error || "Something went wrong");

		toast.success("Invitation accepted successfully");
		await refreshNuxtData([`${user.value?.id}-workspaces`, "pending-invitations"]);
		inProgressId.value = null;
	} catch (error) {
		toast(String(error));
		inProgressId.value = null;
	}
};
</script>

<template>
	<Card v-if="data?.invitations && data?.invitations?.length" class="mb-6 border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10">
		<CardHeader>
			<CardTitle class="text-lg">Pending Invitations</CardTitle>
			<CardDescription>You have workspace invitations waiting for your response</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				<div v-for="invitation in data.invitations" :key="invitation.invitationId" class="flex items-center justify-between rounded-lg border p-4">
					<div>
						<h3 class="font-medium">{{ invitation.workspaceTitle }}</h3>
						<p class="text-muted-foreground text-sm">{{ invitation.workspaceDescription }}</p>
						<div class="mt-1 flex items-center gap-2 text-sm">
							<span>Invited by {{ invitation.invitedBy.firstName }} {{ invitation.invitedBy.lastName }}</span>
							<span>•</span>
							<Badge variant="outline">Admin</Badge>
							<span>•</span>
							<span class="text-muted-foreground">{{ formatTimeAgo(new Date(invitation.invitedAt)) }}</span>
						</div>
					</div>
					<div class="flex gap-2">
						<Button variant="outline" size="sm" :disabled="isLoading"> Decline </Button>
						<Button size="sm" class="bg-black text-white hover:bg-black/90" :disabled="isLoading" @click="acceptInvitation(invitation)"> Accept </Button>
					</div>
				</div>
			</div>
		</CardContent>
	</Card>
</template>
