<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import type { ApiResponse, Task } from "~/types";

const props = defineProps<{ parentId: string; workspaceSlug: string }>();

/*
 * A subtask is reached through its parent or through a filter that cut across
 * the hierarchy, so it can be opened with no idea what it belongs to. This is
 * the way back up.
 */
const { data: parent } = useQuery({
	queryKey: computed(() => ["task", props.parentId]),
	queryFn: async () => {
		const { success, data } = await useApiFetch<ApiResponse<Task>>(API_ENDPOINTS.workspaces.taskById(props.workspaceSlug, props.parentId));
		if (!success || !data) throw new Error("Unable to load the parent task.");
		return data;
	},
});
</script>

<template>
	<NuxtLink :to="`/app/workspaces/${workspaceSlug}/tasks?taskId=${parentId}`" class="focus-ring text-text-tertiary hover:text-text-primary inline-flex max-w-full items-center gap-1.5 text-xs">
		<Icon name="lucide:corner-left-up" :size="13" class="shrink-0" />
		<span class="shrink-0">Subtask of</span>
		<span class="truncate font-medium">{{ parent?.title ?? "…" }}</span>
	</NuxtLink>
</template>
