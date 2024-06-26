import axios from "axios";

export default defineNuxtPlugin(() => {
	const bearerToken = useStatefulCookie("accessToken").value;
	const baseURL = import.meta.env.VITE_API_URL;
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
