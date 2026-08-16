import { useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import { storeToRefs } from "pinia";

export const useLogout = () => {
	const { user } = storeToRefs(useStore());
	const token = useCookie<string | undefined>("TG-AUTHTOKEN");
	const queryClient = useQueryClient();

	const logout = async () => {
		try {
			await useApiFetch(API_ENDPOINTS.auth.logout, { method: "POST" });
		} catch {
			// A local logout must still succeed when the server session has already expired.
		}

		user.value = null;
		token.value = undefined;
		await queryClient.cancelQueries({ queryKey: ["workspaces"] });
		queryClient.removeQueries({ queryKey: ["workspaces"] });
		queryClient.removeQueries({ queryKey: ["workspace"] });
		queryClient.removeQueries({ queryKey: ["workspace-teams"] });
		clearNuxtData();
		toast.success("Signed out.");
		return navigateTo("/");
	};

	return { logout };
};
