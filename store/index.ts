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
			workspaces.value = newUser.workspaces;
			if (activeWorkspace.value === "") activeWorkspace.value = workspaces.value[0].id;
			// tasks.value = workspaces.value.find((workspace: Workspace) => workspace.id === activeWorkspace.value)?.tasks || [];
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
					.select("*, workspaces:workspaces(id, title, description, created_by, members)")
					.eq("id", useSupabaseUser().value?.id)
					.contains("workspaces.members", [useSupabaseUser().value?.id]);

				if (error) throw new Error(error.message);

				setUser(data[0]);
			} catch (error) {
				throw createError({
					message: "An error occurred while fetching your user information. Please try again!",
					statusCode: 500,
				});
			}
		};

		const setWorkspace = (name: string) => {
			const workspace = workspaces.value.find((workspace: Workspace) => workspace.title === name);
			if (workspace) activeWorkspace.value = workspace.id;
			else activeWorkspace.value = workspaces.value[0].id;
		};

		const logout = async () => {
			await client.auth.signOut();
			const cookie = useCookie("store");
			cookie.value = null;
			navigateTo("/login");
		};

		return {
			user,
			profilePhoto,
			tasks,
			setUser,
			fetchUserTasks,
			fetchUserInfo,
			workspaces,
			activeWorkspace,
			setWorkspace,
			logout,
		};
	},
	{ persist: true },
);
