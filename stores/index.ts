import { defineStore } from "pinia";
import type { User } from "~/types";

export const useStore = defineStore("store", () => {
	const user = ref<User | null>(null);

	return { user };
});
