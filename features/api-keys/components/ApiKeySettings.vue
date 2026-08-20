<script lang="ts" setup>
import { toast } from "vue-sonner";
import { useWorkspaceApiKeys, type WorkspaceApiKey } from "../composables/useWorkspaceApiKeys";

const props = defineProps<{ workspaceSlug: string }>();

const config = useRuntimeConfig();
const mcpUrl = computed(() => `${String(config.public.apiBaseUrl).replace(/\/$/, "")}/mcp`);

const { keys, isLoading, isError, error, refetch, create, revoke } = useWorkspaceApiKeys(() => props.workspaceSlug);

const isCreateOpen = ref(false);
const keyName = ref("");
const revealedKey = ref<string | null>(null);
const pendingRevoke = ref<WorkspaceApiKey | null>(null);
const isRevokeOpen = computed({
	get: () => Boolean(pendingRevoke.value),
	set: (open: boolean) => {
		if (!open) pendingRevoke.value = null;
	},
});

const activeKeys = computed(() => keys.value.filter((item) => !item.revokedAt));
const revokedKeys = computed(() => keys.value.filter((item) => item.revokedAt));

const cursorConfig = computed(() =>
	JSON.stringify(
		{
			mcpServers: {
				taskgid: {
					url: mcpUrl.value,
					headers: {
						Authorization: "Bearer YOUR_API_KEY",
					},
				},
			},
		},
		null,
		2
	)
);

const claudeCodeConfig = computed(() =>
	JSON.stringify(
		{
			mcpServers: {
				taskgid: {
					type: "http",
					url: mcpUrl.value,
				},
			},
		},
		null,
		2
	)
);

const openCreate = () => {
	keyName.value = "";
	revealedKey.value = null;
	isCreateOpen.value = true;
};

const closeCreate = () => {
	isCreateOpen.value = false;
	keyName.value = "";
	revealedKey.value = null;
};

const submitCreate = async () => {
	const name = keyName.value.trim();
	if (!name) {
		toast.error("Give this key a name so you can tell it apart later.");
		return;
	}
	try {
		const created = await create.mutateAsync(name);
		revealedKey.value = created.key;
		keyName.value = "";
	} catch {
		// create.onError already toasts
	}
};

const copyText = async (value: string, label: string) => {
	try {
		await navigator.clipboard.writeText(value);
		toast.success(`${label} copied.`);
	} catch {
		toast.error("Unable to copy. Select the text and copy it manually.");
	}
};

const confirmRevoke = () => {
	const target = pendingRevoke.value;
	if (!target) return;
	revoke.mutate(target.id, {
		onSettled: () => {
			pendingRevoke.value = null;
		},
	});
};

const ownerLabel = (key: WorkspaceApiKey) => {
	if (!key.owner) return null;
	const full = [key.owner.firstName, key.owner.lastName].filter(Boolean).join(" ").trim();
	return full || key.owner.username;
};
</script>

<template>
	<section class="space-y-6">
		<div class="flex flex-wrap items-start justify-between gap-4">
			<div>
				<h2 class="text-text-primary text-sm font-bold">API keys &amp; MCP</h2>
				<p class="text-text-secondary mt-1 text-sm leading-6">
					Connect Claude, Cursor, or any MCP client to this workspace. Claude.ai uses OAuth (no key to paste). Other clients can use a workspace API key. Agent actions show up on tasks as
					coming from an agent.
				</p>
			</div>
			<Button size="sm" @click="openCreate">
				<Icon name="lucide:plus" :size="15" />
				New key
			</Button>
		</div>

		<div class="border-border bg-surface-1 space-y-3 rounded-md border p-4">
			<div class="flex flex-wrap items-center justify-between gap-2">
				<div class="min-w-0">
					<p class="product-label">MCP endpoint</p>
					<p class="text-text-primary mt-1 font-mono text-xs break-all">{{ mcpUrl }}</p>
				</div>
				<Button variant="secondary" size="sm" @click="copyText(mcpUrl, 'Endpoint')">
					<Icon name="lucide:copy" :size="14" />
					Copy
				</Button>
			</div>
			<p class="text-text-tertiary text-xs leading-5">
				Claude.ai discovers OAuth automatically from this URL — leave Client ID and Client Secret empty. For clients that only support a bearer token, use
				<code class="bg-surface-2 rounded px-1 py-0.5 font-mono">Authorization: Bearer tg_key_…</code>
				from a key below.
			</p>
		</div>

		<div class="border-border space-y-3 rounded-md border p-4">
			<p class="text-sm font-medium">Claude.ai</p>
			<ol class="text-text-tertiary list-decimal space-y-1 ps-4 text-xs leading-5">
				<li>In Claude, add a custom connector / remote MCP server.</li>
				<li>
					Paste the endpoint
					<code class="text-text-secondary font-mono">{{ mcpUrl }}</code>
					.
				</li>
				<li>Leave OAuth Client ID and Client Secret blank (dynamic registration).</li>
				<li>Complete the browser sign-in and pick this workspace when prompted.</li>
			</ol>
		</div>

		<div class="grid gap-4 lg:grid-cols-2">
			<div class="border-border space-y-2 rounded-md border p-4">
				<div class="flex items-center justify-between gap-2">
					<p class="text-sm font-medium">Cursor (API key)</p>
					<Button variant="ghost" size="sm" @click="copyText(cursorConfig, 'Cursor config')">
						<Icon name="lucide:copy" :size="14" />
						Copy
					</Button>
				</div>
				<pre class="bg-surface-1 text-text-secondary overflow-x-auto rounded-sm p-3 font-mono text-[11px] leading-5">{{ cursorConfig }}</pre>
			</div>
			<div class="border-border space-y-2 rounded-md border p-4">
				<div class="flex items-center justify-between gap-2">
					<p class="text-sm font-medium">Claude Code (OAuth)</p>
					<Button variant="ghost" size="sm" @click="copyText(claudeCodeConfig, 'Claude Code config')">
						<Icon name="lucide:copy" :size="14" />
						Copy
					</Button>
				</div>
				<pre class="bg-surface-1 text-text-secondary overflow-x-auto rounded-sm p-3 font-mono text-[11px] leading-5">{{ claudeCodeConfig }}</pre>
				<p class="text-text-tertiary text-xs">No headers — the client runs the OAuth browser flow.</p>
			</div>
		</div>

		<div class="space-y-2">
			<p class="text-sm font-medium">Tools exposed</p>
			<ul class="text-text-tertiary grid gap-1 text-xs sm:grid-cols-2">
				<li><code class="text-text-secondary font-mono">list_tasks</code> — list and filter tasks</li>
				<li><code class="text-text-secondary font-mono">search_tasks</code> — advanced search</li>
				<li><code class="text-text-secondary font-mono">create_task</code> — create a task</li>
				<li><code class="text-text-secondary font-mono">update_task</code> — update a task</li>
				<li><code class="text-text-secondary font-mono">add_comment</code> — comment on a task</li>
				<li><code class="text-text-secondary font-mono">get_workspace_summary</code> — headline stats</li>
			</ul>
		</div>

		<div v-if="isLoading" class="space-y-2">
			<Skeleton class="h-14 w-full" />
			<Skeleton class="h-14 w-full" />
		</div>

		<AppEmptyState
			v-else-if="isError"
			heading="Unable to load API keys"
			:body="String(error || 'Check your connection and try again.')"
			icon="lucide:alert-circle"
			:action="{ label: 'Retry', onClick: () => refetch(), variant: 'secondary' }"
		/>

		<div v-else-if="activeKeys.length === 0" class="border-border rounded-md border border-dashed p-6 text-center">
			<p class="text-sm font-medium">No active keys</p>
			<p class="text-text-tertiary mt-1 text-xs">Create a key, copy it once, then paste it into your MCP client.</p>
		</div>

		<div v-else class="divide-border border-border divide-y overflow-hidden rounded-md border">
			<div v-for="item in activeKeys" :key="item.id" class="flex flex-wrap items-center justify-between gap-3 p-4">
				<div class="min-w-0">
					<p class="text-sm font-medium">{{ item.name }}</p>
					<p class="text-text-tertiary mt-1 font-mono text-xs">{{ item.keyPreview }}</p>
					<p class="text-text-tertiary mt-1 text-xs">
						<span v-if="ownerLabel(item)">{{ ownerLabel(item) }} · </span>
						Created {{ getTimeAgo(new Date(item.createdAt)) }}
						<span v-if="item.lastUsedAt"> · Last used {{ getTimeAgo(new Date(item.lastUsedAt)) }}</span>
						<span v-else> · Never used</span>
					</p>
				</div>
				<Button variant="ghost" size="sm" class="text-danger hover:text-danger" :disabled="revoke.isPending.value" @click="pendingRevoke = item"> Revoke </Button>
			</div>
		</div>

		<div v-if="revokedKeys.length" class="space-y-2">
			<p class="text-text-tertiary text-xs font-medium tracking-wide uppercase">Revoked</p>
			<div class="divide-border border-border divide-y overflow-hidden rounded-md border opacity-70">
				<div v-for="item in revokedKeys" :key="item.id" class="p-4">
					<p class="text-sm font-medium line-through">{{ item.name }}</p>
					<p class="text-text-tertiary mt-1 font-mono text-xs">{{ item.keyPreview }}</p>
					<p class="text-text-tertiary mt-1 text-xs">Revoked {{ getTimeAgo(new Date(item.revokedAt!)) }}</p>
				</div>
			</div>
		</div>

		<Dialog :open="isCreateOpen" @update:open="(open: boolean) => !open && closeCreate()">
			<DialogContent class="border-border w-[calc(100vw-1rem)] max-w-[520px] overflow-hidden border p-0">
				<DialogHeader class="border-border bg-surface-1 border-b px-6 py-5 pe-14">
					<p class="text-text-tertiary font-mono text-xs font-semibold tracking-[0.14em] uppercase">API access</p>
					<DialogTitle class="mt-2 text-2xl font-bold tracking-[-0.03em]">
						{{ revealedKey ? "Copy your key" : "Create an API key" }}
					</DialogTitle>
					<DialogDescription class="text-text-secondary mt-2 text-sm">
						{{
							revealedKey
								? "This is the only time the full key is shown. Store it somewhere safe before you close this dialog."
								: "The key acts as you inside this workspace. Name it after the client that will use it."
						}}
					</DialogDescription>
				</DialogHeader>

				<div class="space-y-5 p-6">
					<template v-if="revealedKey">
						<div class="space-y-2">
							<label class="product-label" for="revealed-api-key">Your API key</label>
							<div class="border-border bg-surface-1 flex items-stretch overflow-hidden rounded-sm border">
								<code id="revealed-api-key" class="text-text-primary min-w-0 flex-1 overflow-x-auto px-3 py-2.5 font-mono text-xs break-all">{{ revealedKey }}</code>
								<Button variant="secondary" class="rounded-none border-0 border-s" @click="copyText(revealedKey, 'API key')">
									<Icon name="lucide:copy" :size="14" />
									Copy
								</Button>
							</div>
						</div>
						<DialogFooter>
							<Button class="w-full sm:w-auto" @click="closeCreate">Done</Button>
						</DialogFooter>
					</template>

					<form v-else class="space-y-5" @submit.prevent="submitCreate">
						<div class="space-y-2">
							<label class="product-label" for="api-key-name">Name</label>
							<Input id="api-key-name" v-model="keyName" maxlength="100" placeholder="Cursor on my laptop" autocomplete="off" />
						</div>
						<DialogFooter class="flex-col gap-2 sm:flex-row sm:justify-end">
							<Button type="button" variant="outline" :disabled="create.isPending.value" @click="closeCreate">Cancel</Button>
							<Button type="submit" :disabled="!keyName.trim() || create.isPending.value" :loading="create.isPending.value">Create key</Button>
						</DialogFooter>
					</form>
				</div>
			</DialogContent>
		</Dialog>

		<AppDeleteAction
			v-model="isRevokeOpen"
			:title="pendingRevoke ? `Revoke “${pendingRevoke.name}”?` : 'Revoke this key?'"
			description="Clients using this key will lose access immediately. You cannot undo this."
			confirm-label="Revoke key"
			@cancel="pendingRevoke = null"
			@confirm="confirmRevoke"
		/>
	</section>
</template>
