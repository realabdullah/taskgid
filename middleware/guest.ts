export default defineNuxtRouteMiddleware(() => {
    const cookies = useCookie("user_id");

    if (cookies.value) {
        return navigateTo('/dashboard');
    }
});