import type { User } from "~/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const decodeJwtPayload = (token: string): Record<string, any> | null => {
	try {
		const base64Url = token.split(".")[1];
		if (!base64Url) return null;

		const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split("")
				.map(function (c) {
					return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
				})
				.join("")
		);

		return JSON.parse(jsonPayload);
	} catch {
		return null;
	}
};

export default defineNuxtRouteMiddleware(async (to) => {
	const tokenCookie = useCookie<string | undefined>("TG-AUTHTOKEN");
	const token = tokenCookie.value;

	let isAuthenticated = false;
	let payload = null;

	if (token) {
		payload = decodeJwtPayload(token);
		if (payload && payload.exp) {
			const expirationTimeInSeconds = payload.exp;
			const currentTimeInSeconds = Math.floor(Date.now() / 1000);

			if (expirationTimeInSeconds > currentTimeInSeconds) isAuthenticated = true;
			else tokenCookie.value = undefined;
		} else tokenCookie.value = undefined;
	}

	const isAuthRoute = to.meta.layout === "auth" || ["/login", "/signup", "/reset-password"].includes(to.path);
	const isAppRoute = to.path.startsWith("/app");

	if (isAuthenticated && isAuthRoute) return navigateTo("/app");
	else if (!isAuthenticated && isAppRoute) return navigateTo("/login");
	if (isAuthenticated && isAppRoute) {
		const userStore = useStore();

		if (!userStore.user) {
			try {
				const { user: res } = await useApiFetch<{ user: User }>("/users/profile", { method: "GET" });
				if (!res) throw new Error("Failed to get user profile");
				userStore.user = { ...res };
			} catch (error) {
				throw createError({
					statusMessage: String(error),
					fatal: true,
				});
			}
		}
	}
});
