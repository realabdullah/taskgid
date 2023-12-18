export const useTask = () => {
	const { $axios } = useNuxtApp();
	const { tasks, user } = storeToRefs(useStore());
	const push = usePush();

	const route = useRoute();
	const task = reactive<Task>({
		_id: "",
		title: "Enter task title",
		description: "Enter a description for the task",
		priority: "Low",
		dueDate: new Date().toISOString(),
		status: "not started",
		workspace: route.params.workspace as string,
		user: {
			username: user.value.username,
			name: user.value.firstName + " " + user.value.lastName,
		},
		assignee: "",
		createdAt: new Date().toISOString(),
	});
	const comments = ref<Comment[]>([]);

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
				statusMessage: (error as any)?.response?.data?.error ?? message,
			});
		}
	};

	const fetchComments = async (id: string) => {
		try {
			const { data } = await $axios.get<CommentsAPIResponse>(`/tasks/${route.params.workspace}/${id}/comments`);
			if (!data.success) throw new Error("Something went wrong");
			comments.value = [...data.comments];
		} catch (error) {}
	};

	const addTaskComment = async (id: string, message: string) => {
		try {
			if (message.trim() === "") return;
			const { data } = await $axios.post<{ success: boolean; comment: Comment }>(`/tasks/${route.params.workspace}/add-comment`, { task: id, message });
			if (!data.success) throw new Error("Something went wrong");
			comments.value.unshift(data.comment);
		} catch (error) {
			push.error("Failed to add comment");
		}
	};

	const deleteTask = async (id: string) => {
		const { data } = await $axios.delete<{ success: boolean }>(`/tasks/${route.params.workspace}/${id}`);
		if (!data.success) push.error("An error occurred while deleting task.");
		push.success("Task deleted successfully.");
		tasks.value = tasks.value.filter((task) => task._id !== id);
	};

	const createNewTask = async (task: Task) => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { _id, createdAt, workspace, user, ...payload } = task;
		const { data } = await $axios.post<TaskAPIResponse>(`/tasks/${route.params.workspace}/create`, payload);
		if (!data.success) throw new Error("Something went wrong");
		tasks.value = [...tasks.value, data.task];
	};

	const updateTask = async (task: Task) => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { _id, createdAt, workspace, user, ...payload } = task;
		const { data } = await $axios.put<TaskAPIResponse>(`/tasks/${route.params.workspace}/${task._id}`, payload);
		if (!data.success) throw new Error("Something went wrong");

		const index = tasks.value.findIndex((t) => t._id === task._id);
		if (index > -1) tasks.value.splice(index, 1, data.task);
	};

	return { comments, task, fetchTask, deleteTask, createNewTask, updateTask, fetchTasks, fetchComments, addTaskComment };
};
