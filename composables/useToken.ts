export const useToken = () => {
	const { $axios } = useNuxtApp();
	const {
		public: { apiUrl },
	} = useRuntimeConfig();
	const push = usePush();

	const esAccessToken = useCookie("esAccessToken");
	const esRefreshToken = useCookie("esRefreshToken");
	const esAccessTokenExpires = useCookie("esAccessTokenExpires");
	const esRefreshTokenExpires = useCookie("esRefreshTokenExpires");

	const currentTime = new Date().toISOString();

	const setToken = (access: Token, refresh: Token) => {
		esAccessToken.value = access.token;
		esRefreshToken.value = refresh.token;
		esAccessTokenExpires.value = access.expires;
		esRefreshTokenExpires.value = refresh.expires;
	};

	const clearToken = () => {
		esAccessToken.value = "";
		esRefreshToken.value = "";
		esAccessTokenExpires.value = "";
		esRefreshTokenExpires.value = "";
		useCookie("store").value = "";
	};

	const refreshAccessToken = async () => {
		try {
			const { data } = await $axios.post(`${apiUrl}/users/refresh`, {
				method: "POST",
				body: JSON.stringify({ refreshToken: esRefreshToken.value }),
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

	const isTokenExpired = computed(() => Date.parse(currentTime) > Date.parse(esAccessTokenExpires.value!));
	const isRefreshTokenExpired = computed(() => Date.parse(currentTime) > Date.parse(esRefreshTokenExpires.value!));
	const isTokenValid = computed(() => esAccessToken.value && !isTokenExpired.value);
	const isRefreshTokenValid = computed(() => esRefreshToken.value && !isRefreshTokenExpired.value);

	return { setToken, isTokenValid, isRefreshTokenValid, refreshAccessToken, logout };
};
