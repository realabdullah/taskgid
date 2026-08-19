<script lang="ts" setup>
import type { TaskRecurrence } from "~/types";
import { useWorkspacesStore } from "~/features/workspaces/stores";
import { describeRule } from "../composables/useRecurrenceRule";
import { useWorkspaceRecurrences } from "../composables/useWorkspaceRecurrences";
import RecurrenceEditor from "./RecurrenceEditor.vue";

const route = useRoute();
const { workspaces } = storeToRefs(useWorkspacesStore());

const workspaceSlug = computed(() => String(route.params.slug ?? ""));
const workspaceName = computed(() => workspaces.value?.find((workspace) => workspace.slug === workspaceSlug.value)?.title ?? "Workspace");

const { recurrences, isFetching, isError, error, refetch, createRecurrence, updateRecurrence, deleteRecurrence } = useWorkspaceRecurrences(workspaceSlug);

const isAdding = ref(false);
const pendingDelete = ref<TaskRecurrence | null>(null);

const groups = computed(() =>
	[
		{ label: "Active", rules: recurrences.value.filter((rule) => rule.isActive) },
		{ label: "Paused", rules: recurrences.value.filter((rule) => !rule.isActive) },
	].filter((group) => group.rules.length)
);

const create = (payload: { title: string; rrule: string; timezone: string }) => {
	createRecurrence.mutate(payload, { onSuccess: () => (isAdding.value = false) });
};

/*
 * Confirming closes the dialog, which clears `pendingDelete` before the click
 * handler runs. The id is held outside that state so the mutation still has
 * something to delete.
 */
let deleteTargetId = "";
const askDelete = (rule: TaskRecurrence) => {
	deleteTargetId = rule.id;
	pendingDelete.value = rule;
};
const confirmDelete = () => {
	if (deleteTargetId) deleteRecurrence.mutate(deleteTargetId);
	pendingDelete.value = null;
};

const isTogglingId = computed(() => (updateRecurrence.isPending.value ? updateRecurrence.variables.value?.id : undefined));
</script>

<template>
	<div class="product-page">
		<header class="product-header">
			<div>
				<p class="product-eyebrow">{{ workspaceName }} / Recurring</p>
				<h1 class="product-title">Work that comes back.</h1>
				<p class="product-description">
					Each schedule creates a new task when it comes due. Completing a task never changes its schedule, and deleting a schedule keeps every task it has already made.
				</p>
			</div>
			<div class="flex items-center gap-2">
				<Button variant="secondary" @click="navigateTo(`/app/workspaces/${workspaceSlug}/tasks`)"><Icon name="lucide:arrow-left" :size="16" /> All tasks</Button>
				<Button v-if="!isAdding" @click="isAdding = true"><Icon name="lucide:plus" :size="16" /> New schedule</Button>
			</div>
		</header>

		<section v-if="isAdding" class="product-panel p-5 sm:p-7">
			<h2 class="text-text-primary text-sm font-bold">New schedule</h2>
			<div class="mt-4">
				<RecurrenceEditor :is-pending="createRecurrence.isPending.value" @submit="create" @cancel="isAdding = false" />
			</div>
		</section>

		<div v-if="isFetching && !recurrences.length" class="space-y-2"><Skeleton class="h-16 w-full" /><Skeleton class="h-16 w-full" /><Skeleton class="h-16 w-full" /></div>

		<AppEmptyState
			v-else-if="isError"
			heading="Unable to load recurring tasks"
			:body="String(error || 'Check your connection and try again.')"
			icon="lucide:alert-circle"
			:action="{ label: 'Retry', onClick: () => refetch(), variant: 'secondary' }"
		/>

		<AppEmptyState
			v-else-if="!recurrences.length && !isAdding"
			heading="No recurring tasks yet"
			body="A schedule creates the same task again on a cadence you choose — a weekly report, a monthly review, a daily standup note."
			icon="lucide:repeat"
			:action="{ label: 'New schedule', onClick: () => (isAdding = true) }"
		/>

		<template v-else-if="recurrences.length">
			<section v-for="group in groups" :key="group.label" class="space-y-3">
				<h2 class="text-text-tertiary text-xs font-semibold tracking-wide uppercase">
					{{ group.label }} <span class="ms-1 font-mono tabular-nums">{{ group.rules.length }}</span>
				</h2>

				<ul class="product-panel divide-border divide-y">
					<li v-for="rule in group.rules" :key="rule.id" class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
						<div class="min-w-0 flex-1">
							<p class="text-text-primary truncate text-sm font-semibold" :class="{ 'opacity-60': !rule.isActive }">{{ rule.title }}</p>
							<p class="text-text-secondary mt-1 text-xs">
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
								:loading="isTogglingId === rule.id"
								:loading-label="rule.isActive ? 'Pausing' : 'Resuming'"
								:aria-label="rule.isActive ? `Pause ${rule.title}` : `Resume ${rule.title}`"
								@click="updateRecurrence.mutate({ id: rule.id, isActive: !rule.isActive })"
							>
								<Icon :name="rule.isActive ? 'lucide:pause' : 'lucide:play'" :size="14" />
								{{ rule.isActive ? "Pause" : "Resume" }}
							</Button>
							<Button variant="ghost" size="icon" :aria-label="`Delete ${rule.title}`" @click="askDelete(rule)">
								<Icon name="lucide:trash-2" :size="14" />
							</Button>
						</div>
					</li>
				</ul>
			</section>
		</template>

		<AlertDialog :open="Boolean(pendingDelete)" @update:open="(open: boolean) => !open && (pendingDelete = null)">
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete “{{ pendingDelete?.title }}”?</AlertDialogTitle>
					<AlertDialogDescription>No further tasks will be created from this schedule. The tasks it has already created are kept.</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction :disabled="deleteRecurrence.isPending.value" @click="confirmDelete">Delete schedule</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	</div>
</template>
