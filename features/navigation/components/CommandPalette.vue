<script setup lang="ts">
import { useDebounceFn } from "@vueuse/core";
import { toast } from "vue-sonner";
import { useSavedViews } from "~/features/tasks/composables/useSavedViews";
import { useTaskMutations } from "~/features/tasks/composables/useTaskMutations";
import { useWorkspacesStore } from "~/features/workspaces/stores";
import { useStore } from "~/stores";
import type { PaginatedResponse, Task } from "~/types";

const TASK_RESULT_COUNT = 8;

const isOpen = useState<boolean>("command-palette-open", () => false);
const search = ref("");

const route = useRoute();
const workspaceSlug = computed(() => (route.params.slug as string) || "");

const { workspaces } = storeToRefs(useWorkspacesStore());
const hasWorkspace = computed(() => (workspaces.value?.length ?? 0) > 0);

const taskResults = ref<Task[]>([]);
const { user } = storeToRefs(useStore());
const { updateTask } = useTaskMutations(workspaceSlug);
const savedViews = useSavedViews(workspaceSlug);

/** Acts on the first match, which is what a palette result implies. */
const focusedTask = computed(() => taskResults.value[0]);

const assignToMe = async () => {
	const task = focusedTask.value;
	if (!task || !user.value?.username) return;
	const assignees = [...new Set([...task.assignees.map((assignee) => assignee.username), user.value.username])];
	updateTask.mutate({ taskId: task.id, patch: { assignees } });
	close();
};

const markDone = async () => {
	const task = focusedTask.value;
	if (!task) return;
	updateTask.mutate({ taskId: task.id, patch: { status: "done" } });
	close();
};

const switchWorkspace = async (slug: string) => {
	await navigateTo(`/app/workspaces/${slug}/tasks`);
	close();
};

/** `tag:design` searches by tag instead of by title, matching the workbench filter. */
const parseSearch = (raw: string) => {
	const match = raw.trim().match(/^tag:\s*(.+)$/i);
	return match ? { tags: match[1].trim() } : { search: raw.trim() };
};

const fetchTasks = useDebounceFn(async () => {
	const parsed = parseSearch(search.value);
	const term = parsed.tags ?? parsed.search ?? "";
	if (!workspaceSlug.value || term.length < 2) {
		taskResults.value = [];
		return;
	}

	const { success, data } = await useApiFetch<PaginatedResponse<Task>>(API_ENDPOINTS.workspaces.tasks(workspaceSlug.value), {
		query: { ...parsed, page: 1, limit: TASK_RESULT_COUNT },
	});

	taskResults.value = success && data ? data : [];
}, 220);

watch(search, () => {
	fetchTasks();
});

watch(
	() => isOpen.value,
	(open) => {
		if (!open) {
			search.value = "";
			taskResults.value = [];
		}
	}
);

const close = () => {
	isOpen.value = false;
};

const runAction = async (action: "new-task" | "team" | "settings" | "profile") => {
	const fallbackSlug = workspaceSlug.value || workspaces.value?.[0]?.slug || "";
	if (action === "new-task") {
		if (!hasWorkspace.value) {
			toast.info("Create a workspace first to start adding tasks.");
			window.dispatchEvent(new CustomEvent("taskgid:add-workspace-intent"));
			close();
			return;
		}
		await navigateTo(`/app/workspaces/${fallbackSlug}/tasks?create=task`);
	}
	if (action === "team" && fallbackSlug) {
		await navigateTo(`/app/workspaces/${fallbackSlug}/team`);
	} else if (action === "team" && !hasWorkspace.value) {
		toast.info("Create a workspace before opening the team directory.");
		window.dispatchEvent(new CustomEvent("taskgid:add-workspace-intent"));
	}
	if (action === "settings") {
		await navigateTo("/app/settings");
	}
	if (action === "profile") {
		await navigateTo("/app/settings?section=profile");
	}
	close();
};

const openTask = async (task: Task) => {
	if (!workspaceSlug.value) {
		return;
	}
	await navigateTo(`/app/workspaces/${workspaceSlug.value}/tasks?taskId=${task.id}`);
	close();
};
</script>

<template>
	<CommandDialog v-model:open="isOpen" title="Command palette" description="Search tasks and workspaces, or choose an action">
		<Command class="command-surface max-h-[70vh] rounded-lg">
			<CommandInput v-model="search" placeholder="Search tasks and workspaces, or type tag:name…" />
			<CommandList>
				<CommandEmpty>{{ search.trim() ? `No results for “${search.trim()}”.` : "No matching tasks or workspaces." }}</CommandEmpty>

				<CommandGroup heading="Workspaces" class="px-2 py-1">
					<CommandItem v-for="workspace in (workspaces || []).slice(0, 8)" :key="workspace.id" :value="workspace.title" class="h-8 px-3" @select="switchWorkspace(workspace.slug)">
						<Icon name="hugeicons:folder-02" class="text-text-tertiary h-4 w-4" />
						<span>{{ workspace.title }}</span>
					</CommandItem>
				</CommandGroup>

				<CommandSeparator />

				<CommandGroup heading="Tasks" class="px-2 py-1">
					<CommandItem v-for="task in taskResults" :key="task.id" :value="task.title" class="h-8 px-3" @select="openTask(task)">
						<Icon name="hugeicons:task-01" class="text-text-tertiary h-4 w-4" />
						<span class="truncate">{{ task.title }}</span>
					</CommandItem>
				</CommandGroup>

				<CommandSeparator />

				<CommandGroup v-if="focusedTask" heading="On “{{ focusedTask.title }}”" class="px-2 py-1">
					<CommandItem value="Assign to me" class="h-8 px-3" @select="assignToMe">
						<Icon name="hugeicons:user-add-01" class="text-text-tertiary h-4 w-4" />
						<span>Assign to me</span>
					</CommandItem>
					<CommandItem value="Mark done" class="h-8 px-3" @select="markDone">
						<Icon name="hugeicons:checkmark-circle-01" class="text-text-tertiary h-4 w-4" />
						<span>Mark as done</span>
					</CommandItem>
				</CommandGroup>

				<CommandSeparator v-if="focusedTask" />

				<CommandGroup v-if="savedViews.views.value.length" heading="Saved views" class="px-2 py-1">
					<CommandItem v-for="view in savedViews.views.value" :key="view.id" :value="`View ${view.name}`" class="h-8 px-3" @select="savedViews.applyView(view).then(close)">
						<Icon name="hugeicons:bookmark-02" class="text-text-tertiary h-4 w-4" />
						<span>{{ view.name }}</span>
					</CommandItem>
				</CommandGroup>

				<CommandSeparator v-if="savedViews.views.value.length" />

				<CommandGroup heading="Actions" class="px-2 py-1">
					<CommandItem value="Create task" class="h-8 px-3" @select="runAction('new-task')">
						<Icon name="hugeicons:add-01" class="text-text-tertiary h-4 w-4" />
						<span>Create task</span>
					</CommandItem>
					<CommandItem value="Go to team" class="h-8 px-3" @select="runAction('team')">
						<Icon name="hugeicons:user-group" class="text-text-tertiary h-4 w-4" />
						<span>Open team directory</span>
					</CommandItem>
					<CommandItem value="Open settings" class="h-8 px-3" @select="runAction('settings')">
						<Icon name="hugeicons:settings-02" class="text-text-tertiary h-4 w-4" />
						<span>Open settings</span>
					</CommandItem>
					<CommandItem value="Open profile" class="h-8 px-3" @select="runAction('profile')">
						<Icon name="hugeicons:user" class="text-text-tertiary h-4 w-4" />
						<span>Open profile</span>
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</Command>
	</CommandDialog>
</template>
