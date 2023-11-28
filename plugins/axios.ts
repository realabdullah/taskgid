import axios from "axios";

export default defineNuxtPlugin(() => {
	const bearerToken = useStatefulCookie("accessToken").value;
	const config = useRuntimeConfig();
	const baseURL = config.public.apiUrl;
	const instance = axios.create({
		baseURL,
		headers: {
			"Content-Type": "application/json",
			Authorization: "Bearer " + bearerToken,
		},
	});

	return {
		provide: {
			axios: instance,
		},
	};
});
