import { defineStore } from "pinia";

export const useStore = defineStore(
	"store",
	() => {
		const client = useSupabaseClient();

		const user = ref({} as User);
		const profilePhoto = ref("");
		const tasks = ref([] as Task[]);
		const workspaces = ref([] as Workspace[]);
		const activeWorkspace = ref("");

		const setUser = (newUser: User) => {
			user.value = newUser;
			profilePhoto.value = newUser.profile_picture;
		};

		const fetchUserTasks = async () => {
			try {
				const { data, error } = await client.from("tasks").select("*").eq("workspace_id", activeWorkspace.value);

				if (error) throw new Error(error.message);

				tasks.value = data as Task[];
			} catch (error) {
				throw createError({
					message: "An error occurred while fetching your tasks. Please try again!",
					statusCode: 500,
				});
			}
		};

		const fetchUserInfo = async () => {
			try {
				const { data, error } = await client
					.from("users")
					.select("*")
					.eq("id", useSupabaseUser().value?.id);

				if (error) throw error;
				setUser(data[0]);
			} catch {
				throw createError({
					message: "An error occurred while fetching your user information. Please try again!",
					statusCode: 500,
				});
			}
		};

		const fetchUserWorkspaces = async () => {
			try {
				const { data, error } = await client
					.from("workspaces")
					.select("*")
					.eq("user_id", useSupabaseUser().value?.id);

				if (error) throw error;
				workspaces.value = data as Workspace[];
				if (activeWorkspace.value === "") activeWorkspace.value = workspaces.value[0].id;
			} catch {
				throw createError({
					message: "An error occurred while fetching your workspaces. Please try again!",
					statusCode: 500,
				});
			}
		};

		const setActiveWorkspace = async (value = "", usage = "page-load") => {
			if (value === "") activeWorkspace.value = workspaces.value[0].id;
			if (value && usage === "page-load") {
				const workspace = workspaces.value.find((workspace: Workspace) => workspace.title === value || workspace.id === value);
				activeWorkspace.value = workspace ? workspace.id : workspaces.value[0].id;
			} else if (value !== "") activeWorkspace.value = value;
			await fetchUserTasks();
		};

		return {
			user,
			profilePhoto,
			tasks,
			setUser,
			fetchUserTasks,
			fetchUserInfo,
			fetchUserWorkspaces,
			workspaces,
			activeWorkspace,
			setActiveWorkspace,
		};
	},
	{
		persist: true,
	},
);
