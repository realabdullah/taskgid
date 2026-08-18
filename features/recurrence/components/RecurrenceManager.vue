<script lang="ts" setup>
import { describeRule } from "../composables/useRecurrenceRule";
import { useWorkspaceRecurrences } from "../composables/useWorkspaceRecurrences";
import RecurrenceEditor from "./RecurrenceEditor.vue";

const props = defineProps<{ workspaceSlug: string }>();

const { recurrences, isFetching, isError, error, refetch, createRecurrence, updateRecurrence, deleteRecurrence } = useWorkspaceRecurrences(() => props.workspaceSlug);

const isAdding = ref(false);

const create = (payload: { title: string; rrule: string; timezone: string }) => {
	createRecurrence.mutate(payload, { onSuccess: () => (isAdding.value = false) });
};
</script>

<template>
	<section class="space-y-4">
		<div class="flex items-start justify-between gap-4">
			<div>
				<h2 class="text-text-primary text-sm font-bold">Recurring tasks</h2>
				<p class="text-text-secondary mt-1 text-sm leading-6">
					Each schedule creates a new task when it comes due. Completing one never changes the schedule, and deleting a schedule keeps the tasks it already made.
				</p>
			</div>
			<Button v-if="!isAdding" size="sm" variant="secondary" @click="isAdding = true"><Icon name="lucide:plus" :size="15" /> New schedule</Button>
		</div>

		<div v-if="isAdding" class="border-border rounded-sm border p-4">
			<RecurrenceEditor :is-pending="createRecurrence.isPending.value" @submit="create" @cancel="isAdding = false" />
		</div>

		<div v-if="isFetching && !recurrences.length" class="space-y-2"><Skeleton class="h-14 w-full" /><Skeleton class="h-14 w-full" /></div>
		<AppEmptyState
			v-else-if="isError"
			heading="Unable to load recurring tasks"
			:body="String(error || 'Check your connection and try again.')"
			icon="lucide:alert-circle"
			:action="{ label: 'Retry', onClick: () => refetch(), variant: 'secondary' }"
		/>
		<p v-else-if="!recurrences.length && !isAdding" class="text-text-tertiary text-sm">No recurring tasks yet.</p>

		<ul v-else-if="recurrences.length" class="divide-border divide-y">
			<li v-for="rule in recurrences" :key="rule.id" class="flex items-center justify-between gap-4 py-3">
				<div class="min-w-0">
					<p class="text-text-primary truncate text-sm font-semibold" :class="{ 'opacity-60': !rule.isActive }">{{ rule.title }}</p>
					<p class="text-text-secondary mt-0.5 text-xs">
						{{ describeRule(rule.rrule) }}
						<span v-if="rule.nextOccurrence && rule.isActive" class="text-text-tertiary">· next {{ formatDate(rule.nextOccurrence, "MMM D") }}</span>
						<span v-else-if="!rule.isActive" class="text-text-tertiary">· paused</span>
						<span v-else class="text-text-tertiary">· finished</span>
					</p>
				</div>
				<div class="flex shrink-0 items-center gap-1">
					<Button
						variant="ghost"
						size="sm"
						:aria-label="rule.isActive ? `Pause ${rule.title}` : `Resume ${rule.title}`"
						@click="updateRecurrence.mutate({ id: rule.id, isActive: !rule.isActive })"
					>
						<Icon :name="rule.isActive ? 'lucide:pause' : 'lucide:play'" :size="14" />
						{{ rule.isActive ? "Pause" : "Resume" }}
					</Button>
					<Button variant="ghost" size="icon" :aria-label="`Delete ${rule.title}`" @click="deleteRecurrence.mutate(rule.id)">
						<Icon name="lucide:trash-2" :size="14" />
					</Button>
				</div>
			</li>
		</ul>
	</section>
</template>
