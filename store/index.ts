import { defineStore } from "pinia";

export const useStore = defineStore(
	"store",
	() => {
		const client = useSupabaseClient();
		const { sendInviteEmail } = useEmail();

		const user = ref({} as User);
		const profilePhoto = ref("");
		const tasks = ref([] as Task[]);
		const workspaces = ref([] as Workspace[]);
		const activeWorkspace = ref("");
		const members = ref<User[]>([]);

		const setUser = (newUser: User) => {
			user.value = newUser;
			profilePhoto.value = newUser.profile_picture;
			workspaces.value = newUser.workspaces;
			if (activeWorkspace.value === "") activeWorkspace.value = workspaces.value[0].id;
		};

		const fetchWorkspaceMembers = async () => {
			const currentWorkspace = workspaces.value.find((workspace: Workspace) => workspace.id === activeWorkspace.value);

			if (currentWorkspace) {
				const { data, error } = await client.from("users").select("*").in("id", currentWorkspace.members);
				if (error) throw new Error(error.message);
				members.value = data as User[];
			}
		};

		const verifyInviteToken = async (token: string) => {
			const { ok, email, workspace } = await $fetch("/api/verify_token", {
				method: "POST",
				body: JSON.stringify({
					token,
				}),
			});

			if (!ok) throw new Error("Invalid token!");

			return { ok, email, workspace };
		};

		const inviteMember = async (email: string) => {
			const { ok, token } = await $fetch("/api/token", {
				method: "POST",
				body: JSON.stringify({
					workspace: activeWorkspace.value,
					email,
				}),
			});

			if (!ok) throw new Error("An error occurred while generating the invite token. Please try again!");

			await sendInviteEmail(email, user.value.name, token);
		};

		const addUserToWorkspace = async (email: string, token: string, workspace: string) => {
			const { error } = await client.rpc("add_member_to_workspace", { invite_token: token, mail: email, workspace_id: workspace } as never);

			if (error) throw new Error(error.message);
		};

		const fetchWorkspaceTasks = async () => {
			try {
				const { data, error } = await client.from("tasks").select("*").eq("workspace_id", activeWorkspace.value);

				if (error) throw new Error(error.message);

				tasks.value = data as Task[];
				await fetchWorkspaceMembers();
			} catch (error) {
				throw createError({
					message: "An error occurred while fetching workspace tasks. Please try again!",
					statusCode: 500,
				});
			}
		};

		const fetchUserInfo = async () => {
			try {
				const { data, error } = await client
					.from("users")
					.select("*, workspaces:workspaces(id, title, description, created_by, members)")
					.eq("id", useSupabaseUser().value?.id as string)
					.contains("workspaces.members", [useSupabaseUser().value?.id]);

				if (error) throw new Error(error.message);

				setUser(data[0]);
			} catch (error) {
				throw createError({
					message: "An error occurred while fetching your information. Please try again!",
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
			fetchWorkspaceTasks,
			fetchUserInfo,
			workspaces,
			members,
			activeWorkspace,
			setWorkspace,
			logout,
			inviteMember,
			verifyInviteToken,
			addUserToWorkspace,
		};
	},
	{ persist: true },
);
