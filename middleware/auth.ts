export default defineNuxtRouteMiddleware(() => {
    const cookies = useCookie("userAuthenticated");

    if (!cookies.value) {
        return navigateTo('/login');
    }
});