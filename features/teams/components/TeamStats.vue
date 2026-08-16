<script lang="ts" setup>
import { useTeamStats } from "~/features/teams/composables/useTeamStats";

const { isStatsError, isStatsLoading, metrics, period, refetchStats, statsError, statsOpen } = useTeamStats();

const periodOptions: Array<{ label: string; value: "7d" | "30d" | "90d" }> = [
	{ label: "7 days", value: "7d" },
	{ label: "30 days", value: "30d" },
	{ label: "90 days", value: "90d" },
];
</script>

<template>
	<section class="product-panel p-5">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div>
				<p class="product-section-title">The team, at a glance.</p>
				<p class="text-text-secondary mt-1 text-sm">Activity recorded in the selected period.</p>
			</div>

			<div class="flex items-center gap-2">
				<SegmentedControl v-model="period" :options="periodOptions" label="Statistics period" />

				<Button variant="ghost" size="sm" class="h-8" @click="statsOpen = !statsOpen">
					{{ statsOpen ? "Hide stats" : "Show stats" }}
				</Button>
			</div>
		</div>

		<div v-if="statsOpen" class="divide-border border-border mt-5 grid divide-y overflow-hidden rounded-md border md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
			<div v-if="isStatsLoading" class="divide-border col-span-full grid grid-cols-1 divide-y md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
				<Skeleton class="h-24 w-full rounded-none" />
				<Skeleton class="h-24 w-full rounded-none" />
				<Skeleton class="h-24 w-full rounded-none" />
				<Skeleton class="h-24 w-full rounded-none" />
			</div>

			<AppEmptyState
				v-else-if="isStatsError"
				heading="Unable to load team statistics"
				:body="getServerError(statsError, 'Check your connection and try again.')"
				icon="lucide:alert-circle"
				:action="{ label: 'Retry', onClick: () => refetchStats(), variant: 'secondary' }"
			/>

			<template v-else-if="metrics.length">
				<article v-for="metric in metrics" :key="metric.key" class="px-4 py-4 md:px-5">
					<p class="text-text-tertiary text-xs font-semibold">{{ metric.label }}</p>
					<p class="mt-2 font-mono text-3xl font-semibold tracking-[-0.03em] tabular-nums">{{ metric.value }}</p>
					<p class="mt-2 text-xs" :class="metric.deltaTone">{{ metric.deltaLabel }}</p>
				</article>
			</template>

			<AppEmptyState v-else heading="No team statistics yet" body="Team statistics will appear after members start working on tasks." icon="lucide:bar-chart-3" />
		</div>
	</section>
</template>
