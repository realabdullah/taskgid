import axios from "axios";

export default defineNuxtPlugin(() => {
	const { token } = storeToRefs(useTokenStore());
	const { rememberMe } = storeToRefs(useStore());
	const bearerToken = computed(() => (rememberMe.value ? useStatefulCookie("esAccessToken").value : token.value));
	const config = useRuntimeConfig();
	const baseURL = config.public.apiUrl;
	const instance = axios.create({
		baseURL,
		headers: {
			"Content-Type": "application/json",
			Authorization: "Bearer " + bearerToken.value,
		},
	});

	return {
		provide: {
			axios: instance,
		},
	};
});
