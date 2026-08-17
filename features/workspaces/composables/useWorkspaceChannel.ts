import { useQueryClient } from "@tanstack/vue-query";
import { useStore } from "~/stores";
import type { WorkspaceEvent } from "~/composables/useRealtime";

/**
 * Maps workspace events onto the query cache.
 *
 * Targeted invalidation rather than a blanket refetch: a comment arriving on
 * one task should not re-fetch the board. The acting client ignores its own
 * echo, because it has already applied the change optimistically.
 */
export const useWorkspaceChannel = (workspaceSlug: MaybeRefOrGetter<string>) => {
	const client = useQueryClient();
	const { user } = storeToRefs(useStore());

	const onEvent = (event: WorkspaceEvent) => {
		if (event.actorId && event.actorId === user.value?.id) return;

		const taskId = typeof event.payload?.taskId === "string" ? event.payload.taskId : "";
		const slug = toValue(workspaceSlug);

		switch (event.type) {
			case "task.created":
			case "task.deleted":
				void client.invalidateQueries({ queryKey: ["workspace-tasks"] });
				void client.invalidateQueries({ queryKey: ["workspace-tasks-column"] });
				void client.invalidateQueries({ queryKey: ["workspace-stats", slug] });
				break;
			case "task.updated":
				void client.invalidateQueries({ queryKey: ["workspace-tasks"] });
				void client.invalidateQueries({ queryKey: ["workspace-tasks-column"] });
				if (taskId) void client.invalidateQueries({ queryKey: ["task", taskId] });
				break;
			case "comment.created":
				if (taskId) {
					void client.invalidateQueries({ queryKey: ["task-comments", slug, taskId] });
					void client.invalidateQueries({ queryKey: ["task-activities", slug, taskId] });
				}
				break;
		}
	};

	const { status } = useRealtime(workspaceSlug, onEvent);
	return { status };
};
