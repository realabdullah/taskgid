export default defineNuxtRouteMiddleware(() => {
	const router = useRouter();
	const refreshToken = useStatefulCookie("refreshToken");
	const currentTime = new Date().toISOString();

	const refreshTokenIsExpired = computed(() => Date.parse(useStatefulCookie("refreshTokenExpires").value!) < Date.parse(currentTime));
	const isRefreshTokenValid = computed(() => refreshToken.value && !refreshTokenIsExpired.value);

	if (isRefreshTokenValid.value) router.push("/dashboard");
});
