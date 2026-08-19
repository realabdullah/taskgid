<script lang="ts" setup>
import { defaultDraft, draftToRrule, WEEKDAYS, type RecurrenceDraft } from "../composables/useRecurrenceRule";

const emit = defineEmits<{ submit: [payload: { title: string; rrule: string; timezone: string }]; cancel: [] }>();
defineProps<{ isPending?: boolean }>();

const title = ref("");
const draft = reactive<RecurrenceDraft>(defaultDraft());

// The zone the wall-clock time means. "Every Monday at 09:00" is a different
// instant in Lagos and Berlin, so the rule has to carry one.
const timezone = ref(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");

const toggleWeekday = (code: string) => {
	const index = draft.weekdays.indexOf(code);
	if (index === -1) draft.weekdays.push(code);
	// A weekly rule with no day selected would never fire, so the last one stays.
	else if (draft.weekdays.length > 1) draft.weekdays.splice(index, 1);
};

const canSubmit = computed(() => Boolean(title.value.trim()) && Boolean(draft.startDate));

const submit = () => {
	if (!canSubmit.value) return;
	emit("submit", { title: title.value.trim(), rrule: draftToRrule(draft), timezone: timezone.value });
	title.value = "";
	Object.assign(draft, defaultDraft());
};
</script>

<template>
	<form class="space-y-4" @submit.prevent="submit">
		<div class="space-y-1.5">
			<Label for="recurrence-title">Task title</Label>
			<Input id="recurrence-title" v-model="title" placeholder="Weekly ops review" aria-label="Recurring task title" />
		</div>

		<div class="grid gap-3 sm:grid-cols-3">
			<div class="space-y-1.5">
				<Label for="recurrence-frequency">Repeats</Label>
				<select
					id="recurrence-frequency"
					v-model="draft.frequency"
					class="border-border bg-surface-0 focus-visible:border-accent h-10 w-full rounded-sm border px-3 text-sm focus-visible:outline-none"
				>
					<option value="daily">Daily</option>
					<option value="weekly">Weekly</option>
					<option value="monthly">Monthly</option>
				</select>
			</div>
			<div class="space-y-1.5">
				<Label for="recurrence-interval">Every</Label>
				<Input id="recurrence-interval" v-model.number="draft.interval" type="number" min="1" max="52" />
			</div>
			<div class="space-y-1.5">
				<Label for="recurrence-time">At</Label>
				<Input id="recurrence-time" v-model="draft.time" type="time" />
			</div>
		</div>

		<div v-if="draft.frequency === 'weekly'" class="space-y-1.5">
			<Label>On</Label>
			<div class="flex flex-wrap gap-1">
				<Pressable
					v-for="day in WEEKDAYS"
					:key="day.code"
					class="focus-ring rounded-sm border px-2.5 py-1 text-xs"
					:class="draft.weekdays.includes(day.code) ? 'border-accent bg-surface-2 text-text-primary' : 'border-border text-text-tertiary'"
					:aria-pressed="draft.weekdays.includes(day.code)"
					@click="toggleWeekday(day.code)"
				>
					{{ day.label }}
				</Pressable>
			</div>
		</div>

		<div v-if="draft.frequency === 'monthly'" class="space-y-1.5">
			<Label for="recurrence-monthday">Day of month</Label>
			<Input id="recurrence-monthday" v-model.number="draft.monthDay" type="number" min="1" max="28" />
			<p class="text-text-tertiary text-xs">Capped at 28 so every month has the day.</p>
		</div>

		<div class="grid gap-3 sm:grid-cols-2">
			<div class="space-y-1.5">
				<Label for="recurrence-start">Starts</Label>
				<Input id="recurrence-start" v-model="draft.startDate" type="date" />
			</div>
			<div class="space-y-1.5">
				<Label for="recurrence-count">Stop after</Label>
				<Input id="recurrence-count" v-model.number="draft.count" type="number" min="0" max="500" />
				<p class="text-text-tertiary text-xs">0 keeps it running indefinitely.</p>
			</div>
		</div>

		<p class="text-text-tertiary text-xs">A start date in the past is honoured: every occurrence since then is created at once, so the list shows how far behind the work is.</p>

		<div class="flex items-center gap-2">
			<Button type="submit" size="sm" :disabled="!canSubmit || isPending">Create schedule</Button>
			<Button type="button" size="sm" variant="ghost" @click="emit('cancel')">Cancel</Button>
		</div>
	</form>
</template>
