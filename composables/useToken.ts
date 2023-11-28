export const useToken = () => {
	const { $axios } = useNuxtApp();
	const {
		public: { apiUrl },
	} = useRuntimeConfig();
	const push = usePush();
	const currentTime = new Date().toISOString();

	const setToken = (access: Token, refresh: Token) => {
		useStatefulCookie("accessToken").value = access.token;
		useStatefulCookie("refreshToken").value = refresh.token;
		useStatefulCookie("accessTokenExpires").value = access.expires;
		useStatefulCookie("refreshTokenExpires").value = refresh.expires;
	};

	const clearToken = () => {
		useStatefulCookie("accessToken").value = "";
		useStatefulCookie("refreshToken").value = "";
		useStatefulCookie("accessTokenExpires").value = "";
		useStatefulCookie("refreshTokenExpires").value = "";
		useCookie("store").value = "";
	};

	const refreshAccessToken = async () => {
		try {
			const { data } = await $axios.post(`${apiUrl}/auth/refresh`, {
				method: "POST",
				body: JSON.stringify({ refreshToken: useStatefulCookie("refreshToken").value }),
			});
			const { success, accessToken, refreshToken } = data as TokenAPIResponse;
			if (!success) throw new Error("Failed to refresh token");
			else setToken(accessToken, refreshToken);
		} catch (error) {
			navigateTo("/login");
		}
	};

	const logout = async () => {
		try {
			const { data } = await $axios.post(`${apiUrl}/auth/logout`, {
				method: "POST",
			});
			const { success } = data as { success: boolean };
			if (!success) throw new Error("Failed to logout");
			else clearToken();
			navigateTo("/login");
		} catch (error) {
			push.error("Failed to logout");
		}
	};

	const isTokenExpired = computed(() => Date.parse(currentTime) > Date.parse(useStatefulCookie("accessTokenExpires").value!));
	const isRefreshTokenExpired = computed(() => Date.parse(currentTime) > Date.parse(useStatefulCookie("refreshTokenExpires").value!));
	const isTokenValid = computed(() => useStatefulCookie("accessToken").value && !isTokenExpired.value);
	const isRefreshTokenValid = computed(() => useStatefulCookie("refreshToken").value && !isRefreshTokenExpired.value);

	return { setToken, clearToken, isTokenValid, isRefreshTokenValid, refreshAccessToken, logout };
};
