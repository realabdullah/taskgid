export default defineNuxtRouteMiddleware(() => {
    const cookies = useCookie("sb-access-token");

    if (!cookies.value) {
        return navigateTo('/login');
    }
});