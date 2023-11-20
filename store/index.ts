import { defineStore } from "pinia";

export const useStore = defineStore(
	"store",
	() => {
		const user = ref({} as User);
		const userId = computed(() => user.value._id);
		const profilePhoto = ref("");
		const tasks = ref([] as Task[]);
		const workspaces = ref([] as Workspace[]);
		const currentWorkspace = ref({} as Workspace);
		const teams = ref([] as Team[]);
		const rememberMe = ref(false);
		const showNotifications = ref(false);
		const notifications = ref([] as Notification[]);
		const allNotificationsRead = computed(() => {
			return notifications.value.every((n) => n.read);
		});

		return {
			user,
			userId,
			profilePhoto,
			tasks,
			workspaces,
			currentWorkspace,
			teams,
			rememberMe,
			notifications,
			showNotifications,
			allNotificationsRead,
		};
	},
	{ persist: true },
);
