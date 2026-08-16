<script lang="ts" setup>
import { useNotificationInbox } from "../composables/useNotificationInbox";

const { open, unreadCount, mountError, inboxMountTarget, hasApplicationIdentifier, missingConfigurationHeading, missingConfigurationBody, inboxErrorBody } = useNotificationInbox();
</script>

<template>
	<Popover v-model:open="open">
		<PopoverTrigger as-child>
			<Button variant="ghost" size="icon" class="relative h-9 w-9 shrink-0" aria-label="Open notifications">
				<Icon name="hugeicons:notification-02" :size="18" />
				<span v-if="unreadCount > 0 && unreadCount <= 9" class="bg-danger absolute end-2 top-2 h-2 w-2 rounded-full" />
				<span
					v-else-if="unreadCount > 9"
					class="bg-danger text-destructive-foreground absolute end-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-xs font-medium tabular-nums"
				>
					{{ unreadCount }}
				</span>
			</Button>
		</PopoverTrigger>
		<PopoverContent align="end" class="border-border bg-surface-0 w-[calc(100vw-1rem)] max-w-[360px] border p-0">
			<AppEmptyState v-if="!hasApplicationIdentifier" :heading="missingConfigurationHeading" :body="missingConfigurationBody" icon="lucide:bell-off" />
			<AppEmptyState v-else-if="mountError" heading="Unable to load notifications" :body="inboxErrorBody" icon="lucide:alert-circle" />
			<div v-else ref="inboxMountTarget" class="min-h-[340px]" />
		</PopoverContent>
	</Popover>
</template>
