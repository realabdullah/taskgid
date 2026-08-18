<script lang="ts" setup>
import { EVENT_SETTINGS, minutesToTime, useNotificationPreferences, type NotificationPreferences } from "../composables/useNotificationPreferences";

const props = withDefaults(defineProps<{ workspaceSlug?: string }>(), { workspaceSlug: undefined });

const { clearOverride, detectedTimezone, disableQuietHours, error, isError, isLoading, preferences, quietHoursEnabled, refetch, save, setQuietHours } = useNotificationPreferences(
	() => props.workspaceSlug
);

const isWorkspaceScope = computed(() => Boolean(props.workspaceSlug));
const quietStart = ref("22:00");
const quietEnd = ref("07:00");

watch(preferences, (value) => {
	if (!value) return;
	if (value.quietHoursStart !== null) quietStart.value = minutesToTime(value.quietHoursStart);
	if (value.quietHoursEnd !== null) quietEnd.value = minutesToTime(value.quietHoursEnd);
});

const toggle = (key: keyof NotificationPreferences, value: boolean) => save.mutate({ [key]: value });

const timezoneOptions = computed(() => {
	const stored = preferences.value?.timezone || "UTC";
	return [...new Set([detectedTimezone.value, stored, "UTC"])];
});
</script>

<template>
	<div v-if="isLoading" class="space-y-3"><Skeleton class="h-12 w-full" /><Skeleton class="h-12 w-full" /><Skeleton class="h-12 w-full" /></div>

	<AppEmptyState
		v-else-if="isError"
		heading="Unable to load your notification settings"
		:body="String(error || 'Check your connection and try again.')"
		icon="lucide:alert-circle"
		:action="{ label: 'Retry', onClick: () => refetch(), variant: 'secondary' }"
	/>

	<div v-else-if="preferences" class="space-y-8">
		<div v-if="isWorkspaceScope" class="border-border bg-surface-1 flex items-center justify-between gap-4 rounded-md border p-4">
			<div>
				<p class="text-sm font-medium">{{ preferences.hasOverride ? "This workspace has its own settings" : "Following your account settings" }}</p>
				<p class="text-text-tertiary mt-1 text-xs">Changing anything here applies to this workspace only.</p>
			</div>
			<Button v-if="preferences.hasOverride" variant="secondary" size="sm" :disabled="clearOverride.isPending.value" @click="clearOverride.mutate()"> Reset to account settings </Button>
		</div>

		<section>
			<h3 class="text-text-primary text-sm font-bold">What notifies you</h3>
			<div class="divide-border border-border mt-3 divide-y overflow-hidden rounded-md border">
				<div v-for="setting in EVENT_SETTINGS" :key="String(setting.key)" class="flex items-center justify-between gap-4 p-4">
					<div class="min-w-0">
						<p class="text-sm font-medium">{{ setting.label }}</p>
						<p class="text-text-tertiary mt-1 text-xs">{{ setting.description }}</p>
					</div>
					<Switch
						:model-value="Boolean(preferences[setting.key])"
						:aria-label="setting.label"
						:disabled="save.isPending.value"
						@update:model-value="(value: boolean) => toggle(setting.key, value)"
					/>
				</div>
			</div>
		</section>

		<section>
			<h3 class="text-text-primary text-sm font-bold">Where they go</h3>
			<div class="divide-border border-border mt-3 divide-y overflow-hidden rounded-md border">
				<div class="flex items-center justify-between gap-4 p-4">
					<div>
						<p class="text-sm font-medium">In the app</p>
						<p class="text-text-tertiary mt-1 text-xs">The bell in the header.</p>
					</div>
					<Switch :model-value="preferences.inAppEnabled" aria-label="In-app notifications" @update:model-value="(v: boolean) => toggle('inAppEnabled', v)" />
				</div>
				<div class="flex items-center justify-between gap-4 p-4">
					<div>
						<p class="text-sm font-medium">Email</p>
						<p class="text-text-tertiary mt-1 text-xs">Sent to your account address.</p>
					</div>
					<Switch :model-value="preferences.emailEnabled" aria-label="Email notifications" @update:model-value="(v: boolean) => toggle('emailEnabled', v)" />
				</div>
			</div>
		</section>

		<section v-if="!isWorkspaceScope">
			<h3 class="text-text-primary text-sm font-bold">Summaries</h3>
			<p class="text-text-secondary mt-1 text-sm">Digests are off unless you ask for them.</p>
			<div class="divide-border border-border mt-3 divide-y overflow-hidden rounded-md border">
				<div class="flex items-center justify-between gap-4 p-4">
					<div>
						<p class="text-sm font-medium">Daily "what's on you"</p>
						<p class="text-text-tertiary mt-1 text-xs">One message each morning, in your timezone.</p>
					</div>
					<Switch :model-value="preferences.dailyDigest" aria-label="Daily digest" @update:model-value="(v: boolean) => toggle('dailyDigest', v)" />
				</div>
				<div class="flex items-center justify-between gap-4 p-4">
					<div>
						<p class="text-sm font-medium">Weekly workspace summary</p>
						<p class="text-text-tertiary mt-1 text-xs">What moved, and what did not.</p>
					</div>
					<Switch :model-value="preferences.weeklyDigest" aria-label="Weekly digest" @update:model-value="(v: boolean) => toggle('weeklyDigest', v)" />
				</div>
			</div>
		</section>

		<section v-if="!isWorkspaceScope">
			<h3 class="text-text-primary text-sm font-bold">Quiet hours</h3>
			<p class="text-text-secondary mt-1 text-sm">Email pauses during these hours. Mentions always come through, and nothing is lost — it still appears in the app.</p>
			<div class="mt-3 flex flex-wrap items-end gap-3">
				<div class="space-y-1">
					<label for="quiet-start" class="product-label">From</label>
					<Input id="quiet-start" v-model="quietStart" type="time" class="w-32" />
				</div>
				<div class="space-y-1">
					<label for="quiet-end" class="product-label">Until</label>
					<Input id="quiet-end" v-model="quietEnd" type="time" class="w-32" />
				</div>
				<Button :disabled="save.isPending.value" @click="setQuietHours(quietStart, quietEnd)">{{ quietHoursEnabled ? "Update" : "Enable" }}</Button>
				<Button v-if="quietHoursEnabled" variant="ghost" :disabled="save.isPending.value" @click="disableQuietHours">Turn off</Button>
			</div>
		</section>

		<section v-if="!isWorkspaceScope">
			<h3 class="text-text-primary text-sm font-bold">Timezone</h3>
			<p class="text-text-secondary mt-1 text-sm">Decides what counts as overdue and today, and when digests arrive.</p>
			<div class="mt-3 flex flex-wrap items-center gap-3">
				<Select :model-value="preferences.timezone" @update:model-value="(value: unknown) => save.mutate({ timezone: String(value) })">
					<SelectTrigger class="w-72" aria-label="Timezone"><SelectValue /></SelectTrigger>
					<SelectContent>
						<SelectItem v-for="zone in timezoneOptions" :key="zone" :value="zone">{{ zone }}</SelectItem>
					</SelectContent>
				</Select>
				<Button v-if="preferences.timezone !== detectedTimezone" variant="secondary" size="sm" @click="save.mutate({ timezone: detectedTimezone })"> Use {{ detectedTimezone }} </Button>
			</div>
		</section>
	</div>
</template>
