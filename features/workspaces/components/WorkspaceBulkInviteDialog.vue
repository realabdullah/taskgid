<script lang="ts" setup>
import type { Workspace } from "~/types";
import { useBulkWorkspaceInvites } from "../composables/useBulkWorkspaceInvites";

const props = defineProps<{ workspace: Workspace }>();
const isOpen = defineModel<boolean>();

const { results, isSending, progress, isDone, parsedEmails, reset, submit: onSubmit } = useBulkWorkspaceInvites(() => props.workspace.id);

const onClose = (open: boolean) => {
	if (!open) reset();
	isOpen.value = open;
};
</script>

<template>
	<Dialog :open="isOpen" @update:open="onClose">
		<DialogContent class="max-h-[90vh] w-[calc(100vw-1rem)] overflow-y-auto sm:max-w-[520px]">
			<DialogHeader>
				<DialogTitle>Invite multiple people</DialogTitle>
				<DialogDescription>Add people to “{{ workspace.title }}.” Enter one email address per line or separate addresses with commas.</DialogDescription>
			</DialogHeader>

			<div v-if="!isDone" class="space-y-5 py-2">
				<form class="space-y-4" @submit="onSubmit">
					<FormField v-slot="{ componentField }" name="emails">
						<FormItem>
							<FormLabel>Email addresses</FormLabel>
							<FormControl>
								<Textarea
									v-bind="componentField"
									placeholder="alice@example.com&#10;bob@example.com&#10;carol@example.com"
									class="text-md min-h-[120px] resize-none font-mono sm:text-sm"
								/>
							</FormControl>
							<FormDescription class="tabular-nums">{{ parsedEmails.length }} email{{ parsedEmails.length !== 1 ? "s" : "" }} detected</FormDescription>
							<FormMessage />
						</FormItem>
					</FormField>

					<p class="text-muted-foreground text-xs">You can invite up to 10 people at a time.</p>

					<div v-if="isSending" class="space-y-2">
						<div class="flex items-center justify-between text-sm">
							<span class="text-muted-foreground">Sending invitations…</span>
							<span class="font-medium tabular-nums">{{ progress }}%</span>
						</div>
						<div class="bg-muted h-2 w-full overflow-hidden rounded-full">
							<div class="bg-primary h-full transition-[width] duration-300" :style="{ width: `${progress}%` }" />
						</div>
					</div>

					<DialogFooter class="flex-col gap-2 sm:flex-row sm:justify-end">
						<Button type="button" variant="outline" class="w-full sm:w-auto" :disabled="isSending" @click="onClose(false)">Cancel</Button>
						<Button type="submit" class="w-full tabular-nums sm:w-auto" :disabled="isSending || parsedEmails.length === 0" :loading="isSending" loading-label="Sending…">
							Send {{ parsedEmails.length > 0 ? `${parsedEmails.length} ` : "" }}invitation{{ parsedEmails.length !== 1 ? "s" : "" }}
						</Button>
					</DialogFooter>
				</form>
			</div>

			<div v-else class="space-y-4 py-2">
				<div class="flex items-center gap-3">
					<div class="flex gap-4 text-sm">
						<span class="text-success font-medium tabular-nums">
							<Icon name="hugeicons:checkmark-circle-01" :size="14" class="me-1 inline" />
							{{ results.filter((r) => r.success).length }} sent
						</span>
						<span v-if="results.some((r) => !r.success)" class="text-destructive font-medium tabular-nums">
							<Icon name="hugeicons:alert-circle" :size="14" class="me-1 inline" />
							{{ results.filter((r) => !r.success).length }} failed
						</span>
					</div>
				</div>

				<div class="border-border max-h-[50vh] divide-y overflow-y-auto rounded-md border text-sm">
					<div v-for="result in results" :key="result.email" class="flex items-start justify-between gap-3 px-3 py-2">
						<span class="text-text-primary truncate font-mono">{{ result.email }}</span>
						<span v-if="result.success" class="text-success shrink-0 font-medium">Sent</span>
						<span v-else class="text-destructive shrink-0 text-end">{{ result.error || "Failed" }}</span>
					</div>
				</div>

				<DialogFooter class="flex-col gap-2 sm:flex-row sm:justify-end">
					<Button variant="outline" class="w-full sm:w-auto" @click="reset">Send more invitations</Button>
					<Button class="w-full sm:w-auto" @click="onClose(false)">Done</Button>
				</DialogFooter>
			</div>
		</DialogContent>
	</Dialog>
</template>
