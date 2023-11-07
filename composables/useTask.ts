export const useTask = () => {
	const { $axios } = useNuxtApp();
	const { tasks } = storeToRefs(useStore());
	const push = usePush();

	const route = useRoute();
	const task = reactive<Task>({
		_id: "",
		title: "",
		description: "",
		priority: "",
		dueDate: "",
		status: "not started",
		workspace: "",
		user: {
			username: "",
			name: "",
		},
		assignees: [],
		createdAt: "",
	});

	const fetchTask = async () => {
		try {
			const { data } = await $axios.get<TaskAPIResponse>(`/tasks/${route.params.workspace}/${route.params.id}`);
			if (!data.success) throw new Error("Something went wrong");
			Object.assign(task, data.task);
		} catch (error) {
			const { code, message } = formatError(error);
			throw createError({
				statusCode: code,
				statusMessage: message,
			});
		}
	};

	const fetchTasks = async () => {
		try {
			const { data } = await $axios.get<TasksAPIResponse>(`/tasks/${route.params.workspace}`);
			if (!data.success) throw new Error("Something went wrong");
			tasks.value = [...data.tasks];
		} catch (error) {
			const { code, message } = formatError(error);
			throw createError({
				statusCode: code,
				statusMessage: message,
			});
		}
	};

	const deleteTask = async () => {
		const { data } = await $axios.delete<{ success: boolean }>(`/tasks/${route.params.workspace}/${route.params.id}`);
		if (!data.success) throw new Error("Something went wrong");
		push.success("Task deleted successfully.");
		navigateTo(`/${route.params.workspace}/tasks`);
	};

	const createNewTask = async (task: Task) => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { _id, createdAt, workspace, user, ...payload } = task;
		const { data } = await $axios.post<TaskAPIResponse>(`/tasks/${route.params.workspace}/create`, payload);
		if (!data.success) throw new Error("Something went wrong");
		return data.task;
	};

	const updateTask = async (task: Task) => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { _id, createdAt, workspace, user, ...payload } = task;
		const { data } = await $axios.put<TaskAPIResponse>(`/tasks/${route.params.workspace}/${task._id}`, payload);
		if (!data.success) throw new Error("Something went wrong");
		return data.task;
	};

	const getTaskStatus = (status: string) => {
		switch (status) {
			case "Pending":
				return "pending";
			case "In Progress":
				return "in-progress";
			default:
				return "completed";
		}
	};

	return { task, fetchTask, deleteTask, createNewTask, updateTask, getTaskStatus, fetchTasks };
};
