import { toast } from "vue-sonner";
import { useQueryClient } from "@tanstack/vue-query";

export const useAuth = () => {
	const logout = async () => {
		const token = useCookie<string | undefined>("TG-AUTHTOKEN");
		const { user } = storeToRefs(useStore());
		const queryClient = useQueryClient();

		try {
			await useApiFetch(API_ENDPOINTS.auth.logout, { method: "POST" });
		} catch {
			// Continue local logout even if server logout request fails.
		}

		user.value = null;
		token.value = undefined;
		await queryClient.cancelQueries({ queryKey: ["workspaces"] });
		queryClient.removeQueries({ queryKey: ["workspaces"] });
		queryClient.removeQueries({ queryKey: ["workspace"] });
		queryClient.removeQueries({ queryKey: ["workspace-teams"] });
		clearNuxtData();
		toast("Logged out successfully.");
		return navigateTo("/");
	};

	return { logout };
};
