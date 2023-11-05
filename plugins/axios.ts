import axios from "axios";

export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig();
	const baseURL = config.public.apiUrl;
	const token = useCookie("esAccessToken");
	const instance = axios.create({
		baseURL,
		headers: {
			"Content-Type": "application/json",
			Authorization: "Bearer " + token.value,
		},
	});

	return {
		provide: {
			axios: instance,
		},
	};
});
