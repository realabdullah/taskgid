import { defineStore } from "pinia";

export const useStore = defineStore(
	"store",
	() => {
		const messages = [
			"You have a new task assigned to you",
			"Your task deadline is approaching",
			"A team member has commented on your task",
			"You have been mentioned in a task",
			"A task you were assigned to has been completed",
			"You have a new message from a team member",
			"Your task has been updated",
			"A task you were following has been updated",
			"A team member has requested your review",
			"You have been assigned as a reviewer",
		];

		const user = ref({} as User);
		const profilePhoto = ref("");
		const tasks = ref([] as Task[]);
		const workspaces = ref([] as Workspace[]);
		const currentWorkspace = ref({} as Workspace);
		const teams = ref([] as Team[]);
		const rememberMe = ref(false);
		const showNotifications = ref(false);
		const notifications = ref(
			Array.from({ length: 10 }, () => ({
				message: messages[Math.floor(Math.random() * messages.length)],
				date: new Date().toISOString(),
				read: false,
			})),
		);
		const allNotificationsRead = computed(() => {
			return notifications.value.every((n) => n.read);
		});

		return {
			user,
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
