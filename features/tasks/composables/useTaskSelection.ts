import type { Task } from "~/types";

/**
 * Checkbox selection for the list view.
 *
 * Selection lives here rather than in the component so the bulk bar, the row
 * checkboxes and the keyboard handlers all read the same state.
 */
export const useTaskSelection = (visibleTasks: Ref<Task[]>) => {
	const selectedIds = ref<Set<string>>(new Set());

	// A task that has paged or filtered out of view cannot stay selected —
	// otherwise a bulk action would silently hit rows the user can no longer see.
	watch(visibleTasks, (tasks) => {
		if (selectedIds.value.size === 0) return;
		const visible = new Set(tasks.map((task) => task.id));
		const kept = [...selectedIds.value].filter((id) => visible.has(id));
		if (kept.length !== selectedIds.value.size) selectedIds.value = new Set(kept);
	});

	const selectedTasks = computed(() => visibleTasks.value.filter((task) => selectedIds.value.has(task.id)));
	const selectedCount = computed(() => selectedIds.value.size);
	const hasSelection = computed(() => selectedCount.value > 0);
	const isAllSelected = computed(() => visibleTasks.value.length > 0 && selectedCount.value === visibleTasks.value.length);

	const isSelected = (taskId: string) => selectedIds.value.has(taskId);

	const toggle = (taskId: string) => {
		const next = new Set(selectedIds.value);
		if (next.has(taskId)) next.delete(taskId);
		else next.add(taskId);
		selectedIds.value = next;
	};

	const toggleAll = () => {
		selectedIds.value = isAllSelected.value ? new Set() : new Set(visibleTasks.value.map((task) => task.id));
	};

	const clear = () => {
		selectedIds.value = new Set();
	};

	return { clear, hasSelection, isAllSelected, isSelected, selectedCount, selectedIds, selectedTasks, toggle, toggleAll };
};
