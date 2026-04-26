import { toast } from "vue-sonner";

export const useAuth = () => {
	const logout = async () => {
		await useApiFetch(API_ENDPOINTS.auth.logout, { method: "POST" });
		toast("Logged out successfully.");
		useCookie("TG-AUTHTOKEN").value = undefined;
		clearNuxtData();
		return navigateTo("/");
	};

	return { logout };
};
