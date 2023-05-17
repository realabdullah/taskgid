import jwtDecode from "jwt-decode";

export default defineNuxtRouteMiddleware(() => {
    const cookies = useCookie("sb-access-token");

    if (!cookies.value) {
        return navigateTo('/login');
    }

    const decoded = jwtDecode<{ exp: number }>(cookies.value);
    const exp = decoded.exp;
    const currentTime = Date.now() / 1000;

    if (exp < currentTime) {
        return navigateTo('/login');
    }
});