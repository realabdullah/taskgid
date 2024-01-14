export default defineNuxtRouteMiddleware(() => {
	const router = useRouter();
	const { refreshAccessToken } = useToken();
	const refreshToken = useStatefulCookie("refreshToken");
	const currentTime = new Date().toISOString();

	const tokenIsExpired = computed(() => Date.parse(useStatefulCookie("accessTokenExpires").value!) < Date.parse(currentTime));
	const refreshTokenIsExpired = computed(() => Date.parse(useStatefulCookie("refreshTokenExpires").value!) < Date.parse(currentTime));
	const isTokenValid = computed(() => useStatefulCookie("accessToken").value && !tokenIsExpired.value);
	const isRefreshTokenValid = computed(() => refreshToken.value && !refreshTokenIsExpired.value);

	if (!isTokenValid.value) {
		if (isRefreshTokenValid.value) refreshAccessToken();
		else router.push("/login");
	}
});
