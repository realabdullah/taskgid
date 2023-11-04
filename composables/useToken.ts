export const useToken = () => {
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
	};

	const refreshAccessToken = async () => {
		try {
			const response = await $fetch<TokenAPIResponse>(`${apiUrl}/auth/refresh`, {
				method: "POST",
				body: JSON.stringify({ refreshToken: esRefreshToken.value }),
			});
			const { success, accessToken, refreshToken } = response;
			if (!success) throw new Error("Failed to refresh token");
			else setToken(accessToken, refreshToken);
		} catch (error) {
			navigateTo("/login");
		}
	};

	const logout = async () => {
		try {
			const response = await $fetch<{ success: boolean }>(`${apiUrl}/auth/logout`, {
				method: "POST",
			});
			const { success } = response;
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

	return { setToken, clearToken, isTokenValid, isRefreshTokenValid, refreshAccessToken, logout };
};
