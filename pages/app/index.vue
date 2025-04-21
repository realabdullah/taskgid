<script lang="ts" setup>
import { useDateFormat } from "@vueuse/core";
import type { User } from "~/types";

definePageMeta({
	name: "app",
	title: "Dashboard",
	description: "TaskGid - Dashboard",
});

const user = ref<User>();
</script>

<template>
	<div class="flex h-full flex-1 flex-col overflow-hidden">
		<DashboardHeader />

		<main class="container mx-auto flex-1 overflow-auto p-6">
			<div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
				<div>
					<h1 class="text-2xl font-bold">Welcome back, {{ user?.firstName }}</h1>
					<p class="text-muted-foreground">{{ useDateFormat(user?.createdAt, "MMMM YYYY") }}</p>
				</div>

				<Button class="bg-black text-white hover:bg-black/90">
					<Icon name="hugeicons:plus-sign" :size="16" class="mr-2" />
					Create Workspace
				</Button>
			</div>

			<DashboardPendingInvites />
			<DashboardWorkspaces />
		</main>
	</div>
</template>
