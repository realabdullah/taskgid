import { defineStore } from "pinia";

export const useTokenStore = defineStore("token", () => {
	const token = ref("");
	const rememberMe = ref(false);

	return {
		token,
		rememberMe,
	};
});
