import { defineStore } from "pinia";

export const useStore = defineStore(
	"store",
	() => {
		const { $axios } = useNuxtApp();
		const user = ref({} as User);
		const userId = computed(() => user.value._id);
		const profilePhoto = ref("");
		const tasks = ref([] as Task[]);
		const workspaces = ref([] as Workspace[]);
		const currentWorkspace = ref({} as Workspace);
		const teams = ref([] as Team[]);
		const usePasskey = ref(false);
		const showNotifications = ref(false);
		const notifications = ref([] as Notification[]);
		const savedDevices = ref<Authn[]>([]);
		const allNotificationsRead = computed(() => {
			return notifications.value.every((n) => n.read);
		});

		const getUser = async () => {
			const { data } = await $axios.get<{ success: boolean; user: User }>("/users/get");

			if (data.success) {
				user.value = data.user;
				profilePhoto.value = data.user.profile_picture;
			} else {
				throw createError({
					statusCode: 500,
					statusMessage: "Something went wrong",
				});
			}
		};

		return {
			user,
			userId,
			profilePhoto,
			tasks,
			workspaces,
			currentWorkspace,
			teams,
			usePasskey,
			notifications,
			showNotifications,
			allNotificationsRead,
			savedDevices,
			getUser,
		};
	},
	{ persist: true },
);
