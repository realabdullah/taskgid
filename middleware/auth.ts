export default defineNuxtRouteMiddleware(() => {
	const { isTokenValid, refreshAccessToken, isRefreshTokenValid } = useToken();

	if (!isTokenValid.value && isRefreshTokenValid.value) refreshAccessToken();
	else if (!isTokenValid.value && !isRefreshTokenValid.value) navigateTo("/login");
});
