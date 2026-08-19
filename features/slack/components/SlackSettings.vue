<script lang="ts" setup>
import { toast } from "vue-sonner";
import { SLACK_EVENT_OPTIONS, useWorkspaceSlack, type SlackEventType } from "../composables/useWorkspaceSlack";

const props = defineProps<{ workspaceSlug: string; canManage?: boolean }>();

const {
	installation,
	configured,
	channels,
	isLoading,
	isError,
	error,
	isChannelsLoading,
	refetch,
	connect,
	update,
	disconnect,
} = useWorkspaceSlack(() => props.workspaceSlug);

const route = useRoute();
const router = useRouter();

onMounted(() => {
	const status = route.query.slack;
	if (!status) return;
	if (status === "connected") toast.success("Slack connected. Pick a channel below.");
	else if (status === "error") toast.error("Slack connection failed. Try again.");
	const nextQuery = { ...route.query };
	delete nextQuery.slack;
	delete nextQuery.slack_error;
	void router.replace({ query: nextQuery });
});

const toggleEvent = (type: SlackEventType, enabled: boolean) => {
	if (!installation.value) return;
	const current = new Set(installation.value.eventTypes);
	if (enabled) current.add(type);
	else current.delete(type);
	if (current.size === 0) {
		toast.error("Keep at least one event enabled.");
		return;
	}
	update.mutate({ eventTypes: [...current] });
};

const setChannel = (channelId: string) => {
	update.mutate({ channelId: channelId || null });
};
</script>

<template>
	<section class="space-y-4">
		<div class="flex items-start justify-between gap-4">
			<div>
				<h2 class="text-text-primary text-sm font-bold">Slack</h2>
				<p class="text-text-secondary mt-1 text-sm leading-6">
					Post workspace events to a channel. Messages include Mark done and Claim actions when a task is still open.
				</p>
			</div>
		</div>

		<div v-if="isLoading" class="space-y-2"><Skeleton class="h-14 w-full" /><Skeleton class="h-14 w-full" /></div>

		<AppEmptyState
			v-else-if="isError"
			heading="Unable to load Slack settings"
			:body="String(error || 'Check your connection and try again.')"
			icon="lucide:alert-circle"
			:action="{ label: 'Retry', onClick: () => refetch(), variant: 'secondary' }"
		/>

		<div v-else-if="!configured" class="border-border bg-surface-1 rounded-md border p-4">
			<p class="text-sm font-medium">Slack is not available on this server</p>
			<p class="text-text-tertiary mt-1 text-xs">An administrator needs to configure the Slack app credentials first.</p>
		</div>

		<div v-else-if="!installation" class="border-border flex flex-wrap items-center justify-between gap-4 rounded-md border p-4">
			<div>
				<p class="text-sm font-medium">Not connected</p>
				<p class="text-text-tertiary mt-1 text-xs">Connect a Slack workspace, then choose which channel receives updates.</p>
			</div>
			<Button v-if="canManage !== false" :loading="connect.isPending.value" @click="connect.mutate()">
				<Icon name="lucide:slack" :size="15" />
				Connect Slack
			</Button>
			<p v-else class="text-text-tertiary text-xs">Ask a workspace admin to connect Slack.</p>
		</div>

		<div v-else class="space-y-5">
			<div class="border-border flex flex-wrap items-center justify-between gap-4 rounded-md border p-4">
				<div class="min-w-0">
					<p class="text-sm font-medium">
						Connected to {{ installation.teamName || "Slack" }}
						<span v-if="!installation.isActive" class="text-text-tertiary font-normal"> · paused</span>
					</p>
					<p class="text-text-tertiary mt-1 text-xs">
						<span v-if="installation.channelName">#{{ installation.channelName }}</span>
						<span v-else>No channel selected yet</span>
					</p>
				</div>
				<div v-if="canManage !== false" class="flex shrink-0 items-center gap-2">
					<Button
						variant="secondary"
						size="sm"
						:disabled="update.isPending.value"
						@click="update.mutate({ isActive: !installation.isActive })"
					>
						{{ installation.isActive ? "Pause" : "Resume" }}
					</Button>
					<Button variant="ghost" size="sm" :loading="disconnect.isPending.value" @click="disconnect.mutate()"> Disconnect </Button>
				</div>
			</div>

			<div v-if="canManage !== false" class="space-y-2">
				<label for="slack-channel" class="product-label">Channel</label>
				<div class="flex flex-wrap items-center gap-2">
					<select
						id="slack-channel"
						class="border-border bg-surface-1 text-text-primary focus:border-focus h-10 min-w-[16rem] flex-1 rounded-sm border px-3 text-sm outline-none"
						:value="installation.channelId || ''"
						:disabled="isChannelsLoading || update.isPending.value"
						@change="setChannel(($event.target as HTMLSelectElement).value)"
					>
						<option value="">Select a channel…</option>
						<option v-for="channel in channels" :key="channel.id" :value="channel.id">
							{{ channel.isPrivate ? "🔒 " : "#" }}{{ channel.name }}
						</option>
					</select>
					<p v-if="isChannelsLoading" class="text-text-tertiary text-xs">Loading channels…</p>
				</div>
				<p class="text-text-tertiary text-xs">
					Invite the Taskgid bot to private channels before selecting them. Public channels work once the bot is in the workspace.
				</p>
			</div>

			<div v-if="canManage !== false">
				<p class="text-sm font-medium">Which events post</p>
				<div class="divide-border border-border mt-3 divide-y overflow-hidden rounded-md border">
					<div v-for="option in SLACK_EVENT_OPTIONS" :key="option.type" class="flex items-center justify-between gap-4 p-4">
						<div class="min-w-0">
							<p class="text-sm font-medium">{{ option.label }}</p>
							<p class="text-text-tertiary mt-1 text-xs">{{ option.description }}</p>
						</div>
						<Switch
							:model-value="installation.eventTypes.includes(option.type)"
							:aria-label="option.label"
							:disabled="update.isPending.value"
							@update:model-value="(value: boolean) => toggleEvent(option.type, value)"
						/>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>
