<script setup lang="ts">
import { storeToRefs } from "pinia";
import { toast } from "vue-sonner";

import { useStore } from "~/stores";
import { PendingInvites, WorkspaceInviteDialog } from "~/features/workspaces";
import { useWorkspacesStore } from "~/features/workspaces/stores";
import { formatDate } from "~/utils";
import FocusQueue from "./FocusQueue.vue";
import WorkspaceGrid from "./WorkspaceGrid.vue";
import { useDashboardOverview } from "../composables/useDashboardOverview";

const { user } = storeToRefs(useStore());
const { workspaces } = storeToRefs(useWorkspacesStore());
const isInviteOpen = ref(false);

const { activeFilter, completedTasks, dueTodayTasks, error, filteredTasks, inProgressTasks, isDueToday, isError, isFetching, isOverdue, openTasks, overdueTasks, refetch } = useDashboardOverview();

const selectedWorkspace = computed(() => workspaces.value?.[0]);
const firstName = computed(() => user.value?.firstName || "there");
const currentDate = computed(() => formatDate(new Date().toISOString(), "dddd, MMMM D"));

const greeting = computed(() => {
	const hour = new Date().getHours();
	if (hour < 12) return "Good morning";
	if (hour < 18) return "Good afternoon";
	return "Good evening";
});

const openCreateWorkspace = () => window.dispatchEvent(new CustomEvent("taskgid:add-workspace-intent"));
const createTask = () => {
	if (!selectedWorkspace.value) {
		toast("Create a workspace before adding tasks.");
		openCreateWorkspace();
		return;
	}
	navigateTo(`/app/workspaces/${selectedWorkspace.value.slug}/tasks?create=task`);
};

const openInvite = () => {
	if (!selectedWorkspace.value) {
		toast("Create a workspace before inviting teammates.");
		openCreateWorkspace();
		return;
	}
	isInviteOpen.value = true;
};
</script>

<template>
	<div class="space-y-8 pb-8">
		<section class="border-border bg-surface-0 relative overflow-hidden rounded-xl border px-5 py-7 shadow-xs sm:px-7 sm:py-8 lg:px-8">
			<div aria-hidden="true" class="taskgid-orbit border-border absolute -top-24 -right-16 h-72 w-72 rounded-full border" />
			<div aria-hidden="true" class="taskgid-orbit taskgid-orbit--inner border-border absolute -top-7 -right-4 h-44 w-44 rounded-full border" />
			<div class="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
				<div>
					<p class="text-text-tertiary text-xs font-medium">{{ currentDate }}</p>
					<h1 class="text-text-primary mt-2 max-w-3xl text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{{ greeting }}, {{ firstName }}.</h1>
					<p class="text-text-secondary mt-3 max-w-xl text-sm leading-6">Your work is organized by urgency, so the next useful move stays obvious.</p>
				</div>
				<div class="flex flex-wrap gap-2">
					<Button @click="createTask"><Icon name="lucide:plus" :size="16" />New task</Button>
					<Button variant="secondary" @click="openInvite"><Icon name="lucide:user-plus" :size="16" />Invite</Button>
				</div>
			</div>
		</section>

		<PendingInvites />

		<template v-if="selectedWorkspace">
			<section class="border-border bg-border grid grid-cols-2 gap-px overflow-hidden rounded-xl border lg:grid-cols-4">
				<div class="bg-surface-0 p-4 sm:p-5">
					<p class="text-text-tertiary text-xs font-medium">Open</p>
					<p class="text-text-primary mt-2 text-2xl font-semibold tabular-nums">{{ openTasks.length }}</p>
				</div>
				<div class="bg-surface-0 p-4 sm:p-5">
					<p class="text-text-tertiary text-xs font-medium">In progress</p>
					<p class="text-text-primary mt-2 text-2xl font-semibold tabular-nums">{{ inProgressTasks.length }}</p>
				</div>
				<div class="bg-surface-0 p-4 sm:p-5">
					<p class="text-text-tertiary text-xs font-medium">Due today</p>
					<p class="mt-2 text-2xl font-semibold tabular-nums" :class="dueTodayTasks.length ? 'text-warning' : 'text-text-primary'">{{ dueTodayTasks.length }}</p>
				</div>
				<div class="bg-surface-0 p-4 sm:p-5">
					<p class="text-text-tertiary text-xs font-medium">Overdue</p>
					<p class="mt-2 text-2xl font-semibold tabular-nums" :class="overdueTasks.length ? 'text-danger' : 'text-text-primary'">{{ overdueTasks.length }}</p>
				</div>
			</section>

			<AppEmptyState
				v-if="isError"
				heading="Unable to load your task queue"
				:body="String(error || 'Check your connection and try again.')"
				icon="lucide:alert-circle"
				:action="{ label: 'Retry', onClick: () => refetch(), variant: 'secondary' }"
			/>
			<FocusQueue
				v-else
				v-model:active-filter="activeFilter"
				:tasks="filteredTasks"
				:completed-count="completedTasks.length"
				:loading="isFetching"
				:is-due-today="isDueToday"
				:is-overdue="isOverdue"
			/>

			<WorkspaceGrid />
			<WorkspaceInviteDialog v-model="isInviteOpen" :workspace="selectedWorkspace" />
		</template>

		<section v-else class="border-border bg-surface-0 grid overflow-hidden rounded-xl border shadow-xs lg:grid-cols-[minmax(0,1fr)_340px]">
			<div class="p-6 sm:p-8 lg:p-10">
				<p class="text-primary text-xs font-semibold tracking-[0.08em] uppercase">First workspace</p>
				<h2 class="text-text-primary mt-3 max-w-xl text-3xl font-semibold tracking-[-0.04em]">Give your team one shared place to move work forward.</h2>
				<p class="text-text-secondary mt-3 max-w-lg text-sm leading-6">
					Create a workspace, add the first task, then bring in your team. The setup stays lightweight and you can change everything later.
				</p>
				<Button class="mt-6" @click="openCreateWorkspace"><Icon name="lucide:arrow-right" :size="16" />Create your workspace</Button>
			</div>
			<ol class="border-border bg-surface-1 space-y-5 border-t p-6 lg:border-s lg:border-t-0">
				<li v-for="(step, index) in ['Create a workspace', 'Add your first task', 'Invite your teammates']" :key="step" class="flex items-center gap-3">
					<span class="border-border bg-surface-0 text-text-tertiary flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold">{{ index + 1 }}</span>
					<span class="text-text-primary text-sm font-medium">{{ step }}</span>
				</li>
			</ol>
		</section>
	</div>
</template>
