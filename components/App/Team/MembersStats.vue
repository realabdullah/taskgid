<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import type { TeamPerformanceStat } from "~/types";

const route = useRoute();
const period = shallowRef("week");

const { data } = useQuery({
	queryKey: ["team-members-stat", period],
	queryFn: async () => {
		const url = `/workspaces/${route.params.slug}/team/statistics?period=${period.value}`;
		const { success, message, data } = await useApiFetch<{ success: boolean; message?: string; data: TeamPerformanceStat }>(url, {
			method: "GET",
		});
		if (!success && !data) throw createError({ status: 500, statusMessage: message || "An error occured getting team members stats" });
		return data;
	},
});
</script>

<template>
	<Card>
		<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
			<div>
				<CardTitle>Team Statistics</CardTitle>
				<CardDescription>Team performance and activity</CardDescription>
			</div>
			<Select v-model:model-value="period">
				<SelectTrigger class="w-[120px]">
					<SelectValue placeholder="Select range" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem v-for="item in periods" :key="item.value" :value="item.value">{{ item.label }}</SelectItem>
				</SelectContent>
			</Select>
		</CardHeader>

		<CardContent>
			<div class="mb-5 space-y-4">
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<div class="text-sm font-medium">Task Completion Rate</div>
						<div class="text-sm font-medium">{{ data?.overallStats.completionRate }}%</div>
					</div>
					<div class="bg-muted h-2 w-full overflow-hidden rounded-full">
						<div class="bg-primary h-full" :style="`width: ${data?.overallStats.completionRate}%`" />
					</div>
				</div>

				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<div class="text-sm font-medium">On-time Delivery</div>
						<div class="text-sm font-medium">{{ data?.overallStats.onTimeDeliveryRate }}%</div>
					</div>
					<div class="bg-muted h-2 w-full overflow-hidden rounded-full">
						<div class="h-full bg-green-500" :style="`width: ${data?.overallStats.onTimeDeliveryRate}%`" />
					</div>
				</div>

				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<div class="text-sm font-medium">Team Utilization</div>
						<div class="text-sm font-medium">{{ data?.overallStats.teamUtilizationRate }}%</div>
					</div>
					<div class="bg-muted h-2 w-full overflow-hidden rounded-full">
						<div class="h-full bg-blue-500" :style="`width: ${data?.overallStats.teamUtilizationRate}%`" />
					</div>
				</div>
			</div>

			<Separator />

			<div class="pt-4">
				<h4 class="mb-3 text-sm font-medium">Top Performers</h4>
				<div v-if="data?.topPerformers" class="space-y-3">
					<div v-for="performer in data?.topPerformers" :key="performer.member.id" class="flex items-center justify-between">
						<div class="text-sm">{{ performer.member.firstName }} {{ performer.member.lastName }}</div>
						<div class="text-sm font-medium">{{ performer.completionRate }}% completion</div>
					</div>
				</div>
			</div>
		</CardContent>
	</Card>
</template>
