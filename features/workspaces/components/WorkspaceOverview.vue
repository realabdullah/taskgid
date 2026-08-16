<script lang="ts" setup>
import { RecentTasks } from "~/features/tasks";
import { useWorkspaceOverview } from "~/features/workspaces/composables/useWorkspaceOverview";
import WorkspaceStatistics from "~/features/workspaces/components/WorkspaceStatistics.vue";

const { createTask, isStatsError, isStatsLoading, refetchStats, statOverview, stats, statsError, workspaceSlug } = useWorkspaceOverview();
</script>

<template>
	<div class="space-y-8">
		<div class="border-border flex flex-col justify-between gap-5 border-b pb-6 md:flex-row md:items-end">
			<div>
				<p class="editorial-kicker">Workspace overview</p>
				<h1 class="page-heading mt-1">Tasks, in one view.</h1>
				<p class="page-intro mt-2">Review task activity, ownership, and what needs attention next.</p>
			</div>

			<Button @click="createTask"><Icon name="lucide:plus" :size="16" /> New task</Button>
		</div>

		<div v-if="isStatsLoading" class="divide-border border-border grid divide-y overflow-hidden rounded-lg border md:grid-cols-3 md:divide-x md:divide-y-0">
			<Skeleton class="h-24 w-full" />
			<Skeleton class="h-24 w-full" />
			<Skeleton class="h-24 w-full" />
		</div>

		<AppEmptyState
			v-else-if="isStatsError"
			heading="Unable to load workspace statistics"
			:body="String(statsError || 'Check your connection and try again.')"
			icon="lucide:alert-circle"
			:action="{ label: 'Retry', onClick: () => refetchStats(), variant: 'secondary' }"
		/>

		<div v-else class="divide-border border-border grid divide-y overflow-hidden rounded-lg border md:grid-cols-3 md:divide-x md:divide-y-0">
			<div v-for="stat in statOverview" :key="stat.title" class="flex items-end justify-between gap-4 px-1 py-4 md:px-5">
				<div>
					<p class="text-text-tertiary text-xs font-semibold">{{ stat.title }}</p>
					<p class="mt-1 font-mono text-3xl font-semibold tabular-nums">{{ stat.value }}</p>
					<p class="text-text-secondary mt-1 text-xs">{{ stat.yesterday }}</p>
				</div>
				<Icon :name="stat.icon" :size="18" :class="stat.color" />
			</div>
		</div>

		<div class="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:gap-12">
			<section>
				<div class="mb-4 flex items-end justify-between gap-4">
					<div>
						<h2 class="text-xl font-bold tracking-[-0.025em]">Recent tasks</h2>
						<p class="text-text-secondary mt-1 text-sm">The latest task activity in this workspace.</p>
					</div>
					<NuxtLink :to="`/app/workspaces/${workspaceSlug}/tasks`" class="text-primary text-sm font-semibold hover:underline">View all tasks</NuxtLink>
				</div>
				<RecentTasks />
			</section>
			<WorkspaceStatistics v-if="stats" :stats="stats" />
			<AppEmptyState v-else heading="No activity summary yet" body="Workspace statistics will appear once tasks start moving." icon="lucide:bar-chart-3" />
		</div>
	</div>
</template>
