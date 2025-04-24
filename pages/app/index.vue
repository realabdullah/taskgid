<script lang="ts" setup>
import { useDateFormat } from "@vueuse/core";

definePageMeta({
	name: "app",
	title: "Dashboard",
	description: "TaskGid - Dashboard",
});

const { user } = storeToRefs(useStore());
</script>

<template>
	<div class="flex h-full flex-1 flex-col overflow-hidden">
		<DashboardHeader />

		<main class="container mx-auto flex-1 overflow-auto p-6">
			<div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
				<div>
					<h1 class="text-2xl font-bold">Welcome back, {{ user?.firstName }}</h1>
					<p class="text-muted-foreground">Member since {{ useDateFormat(user?.createdAt, "MMMM YYYY") }}</p>
				</div>

				<DashboardWorkspaceCreateOrEdit is-creating />
			</div>

			<DashboardPendingInvites />
			<DashboardWorkspaces />
		</main>
	</div>
</template>
