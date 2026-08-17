import { useQuery } from "@tanstack/vue-query";
import { useWorkspacesStore } from "~/features/workspaces/stores";
import { useStore } from "~/stores";
import type { PaginatedResponse, Task } from "~/types";

export type MyTask = Task & { workspaceSlug: string; workspaceTitle: string };

export type MyWorkBucket = {
	id: "overdue" | "today" | "week" | "later" | "someday";
	label: string;
	description: string;
	tasks: MyTask[];
};

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

/**
 * Everything assigned to the current user, across every workspace they are in.
 *
 * The filtering is the server's: each workspace is asked for `assignee=me` and
 * open statuses only, rather than pulling the whole workspace down and sifting
 * it client-side. It is still one request per workspace — a single `/me/tasks`
 * endpoint would remove the fan-out, and is worth adding past ~5 workspaces.
 */
export const useMyWork = () => {
	const { user } = storeToRefs(useStore());
	const { workspaces } = storeToRefs(useWorkspacesStore());
	const includeDone = ref(false);

	const query = useQuery({
		queryKey: computed(() => ["my-work", user.value?.id, (workspaces.value ?? []).map((workspace) => workspace.slug), includeDone.value]),
		queryFn: async () => {
			const status = includeDone.value ? "todo,in_progress,done" : "todo,in_progress";
			const sources = await Promise.all(
				(workspaces.value ?? []).map(async (workspace) => {
					const response = await useApiFetch<PaginatedResponse<Task>>(API_ENDPOINTS.workspaces.taskSearch(workspace.slug), {
						query: { assignee: "me", status, sortBy: "dueDate", sortOrder: "ASC", page: 1, limit: 100 },
					});
					if (!response?.success) throw new Error(`Unable to load tasks from ${workspace.title}.`);
					return response.data.map<MyTask>((task) => ({ ...task, workspaceSlug: workspace.slug, workspaceTitle: workspace.title }));
				})
			);
			return sources.flat();
		},
		enabled: computed(() => Boolean(user.value?.id && workspaces.value?.length)),
	});

	const tasks = computed(() => query.data.value ?? []);

	const buckets = computed<MyWorkBucket[]>(() => {
		const today = startOfDay(new Date());
		const tomorrow = addDays(today, 1);
		const endOfWeek = addDays(today, 7);

		const empty: Record<MyWorkBucket["id"], MyTask[]> = { overdue: [], today: [], week: [], later: [], someday: [] };
		for (const task of tasks.value) {
			if (task.status === "done") continue;
			if (!task.dueDate) {
				empty.someday.push(task);
				continue;
			}
			const due = new Date(task.dueDate);
			if (due < today) empty.overdue.push(task);
			else if (due < tomorrow) empty.today.push(task);
			else if (due < endOfWeek) empty.week.push(task);
			else empty.later.push(task);
		}

		return [
			{ id: "overdue", label: "Overdue", description: "Past its due date and still open.", tasks: empty.overdue },
			{ id: "today", label: "Today", description: "Due before the day is out.", tasks: empty.today },
			{ id: "week", label: "This week", description: "Due in the next seven days.", tasks: empty.week },
			{ id: "later", label: "Later", description: "Dated, but not yet urgent.", tasks: empty.later },
			{ id: "someday", label: "No date", description: "Assigned to you with nothing scheduled.", tasks: empty.someday },
		].filter((bucket) => bucket.tasks.length > 0) as MyWorkBucket[];
	});

	const openCount = computed(() => tasks.value.filter((task) => task.status !== "done").length);
	const completedCount = computed(() => tasks.value.filter((task) => task.status === "done").length);
	const hasWorkspaces = computed(() => (workspaces.value?.length ?? 0) > 0);

	return {
		buckets,
		completedCount,
		error: query.error,
		hasWorkspaces,
		includeDone,
		isError: query.isError,
		isLoading: query.isPending,
		openCount,
		refetch: query.refetch,
		tasks,
	};
};
