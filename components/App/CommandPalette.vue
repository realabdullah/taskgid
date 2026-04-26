<script setup lang="ts">
import { useDebounceFn } from "@vueuse/core";
import { toast } from "vue-sonner";
import type { Task, Workspace } from "~/types";

const isOpen = useState<boolean>("command-palette-open", () => false);
const search = ref("");

const route = useRoute();
const workspaceSlug = computed(() => (route.params.slug as string) || "");

const { workspaces } = storeToRefs(useWorkspacesStore());
const hasWorkspace = computed(() => (workspaces.value?.length ?? 0) > 0);

const taskResults = ref<Task[]>([]);

const fetchTasks = useDebounceFn(async () => {
	if (!workspaceSlug.value || search.value.trim().length < 2) {
		taskResults.value = [];
		return;
	}

	const { success, data } = await useApiFetch<{ success: boolean; data: Task[] }>(`/workspaces/${workspaceSlug.value}/tasks`, {
		query: { search: search.value.trim() },
	});

	taskResults.value = success && data ? data.slice(0, 8) : [];
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
		window.dispatchEvent(new CustomEvent("taskgid:new-task-intent"));
	}
	if (action === "team" && fallbackSlug) {
		await navigateTo(`/app/workspaces/${fallbackSlug}/team`);
	} else if (action === "team" && !hasWorkspace.value) {
		toast.info("Create a workspace first to open Team.");
		window.dispatchEvent(new CustomEvent("taskgid:add-workspace-intent"));
	}
	if (action === "settings") {
		if (!hasWorkspace.value) {
			toast.info("Create a workspace first to configure workspace settings.");
			window.dispatchEvent(new CustomEvent("taskgid:add-workspace-intent"));
			close();
			return;
		}
		window.dispatchEvent(new CustomEvent("taskgid:open-settings-intent"));
		if (!workspaceSlug.value && fallbackSlug) {
			await navigateTo(`/app/workspaces/${fallbackSlug}/settings`);
		}
	}
	if (action === "profile") {
		window.dispatchEvent(new CustomEvent("taskgid:open-profile-intent"));
	}
	close();
};

const openWorkspace = async (workspace: Workspace) => {
	await navigateTo(`/app/workspaces/${workspace.slug}/tasks`);
	close();
};

const openTask = async (task: Task) => {
	if (!workspaceSlug.value) {
		return;
	}
	await navigateTo(`/app/workspaces/${workspaceSlug.value}/tasks/${task.id}`);
	close();
};
</script>

<template>
	<CommandDialog v-model:open="isOpen" title="Command Palette" description="Search tasks, workspaces, and quick actions">
		<Command class="border-border bg-surface-0 max-h-[70vh] rounded-xl border">
			<CommandInput v-model="search" placeholder="Search tasks and workspaces..." />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>

				<CommandGroup heading="Workspaces" class="px-2 py-1">
					<CommandItem v-for="workspace in (workspaces || []).slice(0, 8)" :key="workspace.id" :value="workspace.title" class="h-8 px-3" @select="openWorkspace(workspace)">
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

				<CommandGroup heading="Actions" class="px-2 py-1">
					<CommandItem value="Create task" class="h-8 px-3" @select="runAction('new-task')">
						<Icon name="hugeicons:add-01" class="text-text-tertiary h-4 w-4" />
						<span>Create task</span>
					</CommandItem>
					<CommandItem value="Go to team" class="h-8 px-3" @select="runAction('team')">
						<Icon name="hugeicons:user-group" class="text-text-tertiary h-4 w-4" />
						<span>Go to Team</span>
					</CommandItem>
					<CommandItem value="Open settings" class="h-8 px-3" @select="runAction('settings')">
						<Icon name="hugeicons:settings-02" class="text-text-tertiary h-4 w-4" />
						<span>Go to Settings</span>
					</CommandItem>
					<CommandItem value="Open profile" class="h-8 px-3" @select="runAction('profile')">
						<Icon name="hugeicons:user" class="text-text-tertiary h-4 w-4" />
						<span>Open My Profile</span>
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</Command>
	</CommandDialog>
</template>
