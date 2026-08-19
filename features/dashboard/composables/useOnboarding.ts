import { useLocalStorage } from "@vueuse/core";
import { useWorkspacesStore } from "~/features/workspaces/stores";
import { useStore } from "~/stores";
import type { PaginatedResponse, Task } from "~/types";
import { useQuery } from "@tanstack/vue-query";

export type OnboardingStep = {
	id: "workspace" | "invite" | "task" | "complete";
	label: string;
	description: string;
	done: boolean;
	action: string;
	run: () => unknown;
};

/**
 * First-run checklist.
 *
 * Progress is derived from real data rather than stored flags, so it cannot
 * drift from what the account actually contains — the only thing persisted is
 * whether the user dismissed the checklist.
 */
export const useOnboarding = () => {
	const { user } = storeToRefs(useStore());
	const { workspaces, isLoadingWorkspaces } = storeToRefs(useWorkspacesStore());
	const dismissed = useLocalStorage("taskgid:onboarding-dismissed", false);

	const firstWorkspace = computed(() => workspaces.value?.[0]);
	const hasWorkspace = computed(() => Boolean(firstWorkspace.value));
	const hasTeammates = computed(() => (firstWorkspace.value?.memberCount ?? 0) > 1);

	/*
	 * Two counts, one request each: how many tasks exist at all, and how many are
	 * done. `limit: 1` is deliberate — only the pagination total is read.
	 */
	const countsEnabled = computed(() => Boolean(user.value?.id && firstWorkspace.value?.slug && !dismissed.value));

	const {
		data: taskCounts,
		isSuccess: countsLoaded,
		isError: countsFailed,
	} = useQuery({
		queryKey: computed(() => ["onboarding-progress", firstWorkspace.value?.slug]),
		queryFn: async () => {
			const slug = firstWorkspace.value?.slug;
			if (!slug) return { total: 0, done: 0 };
			const [all, done] = await Promise.all([
				useApiFetch<PaginatedResponse<Task>>(API_ENDPOINTS.workspaces.tasks(slug), { query: { page: 1, limit: 1 } }),
				useApiFetch<PaginatedResponse<Task>>(API_ENDPOINTS.workspaces.tasks(slug), { query: { page: 1, limit: 1, status: "done" } }),
			]);
			return { total: all?.pagination?.total ?? 0, done: done?.pagination?.total ?? 0 };
		},
		enabled: countsEnabled,
	});

	const hasTask = computed(() => (taskCounts.value?.total ?? 0) > 0);
	const hasCompletedTask = computed(() => (taskCounts.value?.done ?? 0) > 0);

	const openCreateWorkspace = () => globalThis.window.dispatchEvent(new globalThis.CustomEvent("taskgid:add-workspace-intent"));
	const openWorkspaceSettings = () => navigateTo(`/app/workspaces/${firstWorkspace.value?.slug}/settings`);
	const openTaskComposer = () => navigateTo(`/app/workspaces/${firstWorkspace.value?.slug}/tasks?create=task`);
	const openTasks = () => navigateTo(`/app/workspaces/${firstWorkspace.value?.slug}/tasks`);

	const steps = computed<OnboardingStep[]>(() => [
		{
			id: "workspace",
			label: "Create a workspace",
			description: "A workspace holds a team's tasks, people and history.",
			done: hasWorkspace.value,
			action: "Create workspace",
			run: openCreateWorkspace,
		},
		{
			id: "invite",
			label: "Invite a teammate",
			description: "Taskgid is most useful once work has an owner other than you.",
			done: hasTeammates.value,
			action: "Invite people",
			run: openWorkspaceSettings,
		},
		{
			id: "task",
			label: "Create your first task",
			description: "Give it a description, an owner and a due date.",
			done: hasTask.value,
			action: "Create task",
			run: openTaskComposer,
		},
		{
			id: "complete",
			label: "Complete a task",
			description: "Move something to done — that is the loop the whole app serves.",
			done: hasCompletedTask.value,
			action: "Open tasks",
			run: openTasks,
		},
	]);

	const completedCount = computed(() => steps.value.filter((step) => step.done).length);
	const nextStep = computed(() => steps.value.find((step) => !step.done));
	const isComplete = computed(() => completedCount.value === steps.value.length);

	/*
	 * Every step reads as undone until the data behind it arrives, so showing the
	 * checklist before then offers a finished account a list of things it has
	 * already done, and then withdraws it. Nothing renders until each source has
	 * either answered or been ruled out.
	 */
	const isSettled = computed(() => !isLoadingWorkspaces.value && (!countsEnabled.value || countsLoaded.value || countsFailed.value));

	/*
	 * The checklist disappears on its own once finished, so nobody has to dismiss
	 * a thing that no longer applies.
	 */
	const isVisible = computed(() => isSettled.value && !dismissed.value && !isComplete.value);
	const dismiss = () => (dismissed.value = true);

	return { completedCount, dismiss, isComplete, isVisible, nextStep, steps, totalSteps: computed(() => steps.value.length) };
};
