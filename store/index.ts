import { defineStore } from "pinia";

export const useStore = defineStore(
	"store",
	() => {
		const user = ref({} as User);
		const profilePhoto = ref("");
		const tasks = ref([] as Task[]);

		return {
			user,
			profilePhoto,
			tasks,
		};
	},
	{ persist: true },
);
