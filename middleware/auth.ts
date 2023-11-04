export default defineNuxtRouteMiddleware(() => {
	const { isTokenValid } = useToken();

	if (!isTokenValid.value) return navigateTo("/login");
});
