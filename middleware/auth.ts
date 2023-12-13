export default defineNuxtRouteMiddleware(() => {
	const { isTokenValid, refreshAccessToken, isRefreshTokenValid } = useToken();

	if (!isTokenValid.value) {
		if (isRefreshTokenValid.value) refreshAccessToken();
		else navigateTo("/login");
	}
});
