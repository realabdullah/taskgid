export const useTask = () => {
	const { tasks, activeWorkspace } = storeToRefs(useStore());

	const route = useRoute();
	const client = useSupabaseClient();
	const user = useSupabaseUser();
	const task = reactive<Task>({
		user_id: user.value?.id ?? "",
		id: "",
		title: "",
		description: "",
		dateAdded: "",
		dueDate: "",
		priority: "",
		status: "",
		task_no: 0,
		workspace_id: activeWorkspace.value,
		assigned_to: [],
	});

	const fetchTask = async () => {
		const { data, error } = await client.from("tasks").select().eq("id", route.params.id);
		if (error) throw createError({ statusCode: 404, statusMessage: "Tasks not found!" });
		Object.assign(task, data[0]);
	};

	const deleteTask = async () => {
		const { error } = await client.from("tasks").delete().eq("id", task.id);
		if (error) {
			useEvent("toast", "An error occured while trying to delete task.");
			return;
		}

		navigateTo("/dashboard/tasks");
	};

	const createNewTask = async () => {
		task.dateAdded = new Date().toISOString().substring(0, 10);
		task.task_no = tasks.value ? tasks.value.length + 1 : 1;
		const { error } = await client.from("tasks").insert(task as never);
		if (error) throw new Error(error.message);
	};

	const updateTask = async (id: string) => {
		const { error } = await client
			.from("tasks")
			.update(task as never)
			.eq("id", id);
		if (error) throw new Error(error.message);
	};

	return { task, fetchTask, deleteTask, createNewTask, updateTask };
};
