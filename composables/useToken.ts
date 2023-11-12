export const useToken = () => {
	const { $axios } = useNuxtApp();
	const {
		public: { apiUrl },
	} = useRuntimeConfig();
	const push = usePush();
	const { token } = storeToRefs(useTokenStore());
	const currentTime = new Date().toISOString();

	const setToken = (access: Token, refresh: Token) => {
		useStatefulCookie("esAccessToken").value = access.token;
		useStatefulCookie("esRefreshToken").value = refresh.token;
		useStatefulCookie("esAccessTokenExpires").value = access.expires;
		useStatefulCookie("esRefreshTokenExpires").value = refresh.expires;
	};

	const setTemporaryToken = (tkn: string) => (token.value = tkn);

	const clearToken = () => {
		useStatefulCookie("esAccessToken").value = "";
		useStatefulCookie("esRefreshToken").value = "";
		useStatefulCookie("esAccessTokenExpires").value = "";
		useStatefulCookie("esRefreshTokenExpires").value = "";
		useCookie("store").value = "";
	};

	const refreshAccessToken = async () => {
		try {
			const { data } = await $axios.post(`${apiUrl}/users/refresh`, {
				method: "POST",
				body: JSON.stringify({ refreshToken: useStatefulCookie("esRefreshToken").value }),
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
			const { data } = await $axios.post(`${apiUrl}/users/logout`, {
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

	const isTokenExpired = computed(() => Date.parse(currentTime) > Date.parse(useStatefulCookie("esAccessTokenExpires").value!));
	const isRefreshTokenExpired = computed(() => Date.parse(currentTime) > Date.parse(useStatefulCookie("esRefreshTokenExpires").value!));
	const isTokenValid = computed(() => useStatefulCookie("esAccessToken").value && !isTokenExpired.value);
	const isRefreshTokenValid = computed(() => useStatefulCookie("esRefreshToken").value && !isRefreshTokenExpired.value);

	return { setToken, clearToken, isTokenValid, isRefreshTokenValid, refreshAccessToken, logout, setTemporaryToken };
};
