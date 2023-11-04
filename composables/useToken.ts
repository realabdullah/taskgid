export const useToken = () => {
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

	const isTokenExpired = computed(() => Date.parse(currentTime) > Date.parse(esAccessTokenExpires.value!));
	const isRefreshTokenExpired = computed(() => Date.parse(currentTime) > Date.parse(esRefreshTokenExpires.value!));
	const isTokenValid = computed(() => esAccessToken.value && !isTokenExpired.value);
	const isRefreshTokenValid = computed(() => esRefreshToken.value && !isRefreshTokenExpired.value);

	return { setToken, clearToken, isTokenValid, isRefreshTokenValid };
};
