import { defineStore } from "pinia";

export const useStore = defineStore(
	"store",
	() => {
		const user = ref({} as User);
		const profilePhoto = ref("");
		const tasks = ref([] as Task[]);
		const workspaces = ref([] as Workspace[]);
		const currentWorkspace = ref({} as Workspace);

		return {
			user,
			profilePhoto,
			tasks,
			workspaces,
			currentWorkspace,
		};
	},
	{ persist: true },
);
