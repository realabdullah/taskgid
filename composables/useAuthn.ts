import { browserSupportsWebAuthn, startRegistration, startAuthentication } from "@simplewebauthn/browser";

export const useAuthn = () => {
	const push = usePush();
	const { savedDevices } = storeToRefs(useStore());
	const { $axios } = useNuxtApp();
	const isAuthnSupported = ref(false);

	const getAuthns = async () => {
		const { data } = await $axios.get<{ success: boolean; authns: Authn[] }>("/users/authns");

		if (data.success) savedDevices.value = data.authns;
		else {
			throw createError({
				statusCode: 500,
				statusMessage: "Something went wrong",
			});
		}
	};

	const addAuthn = async (device: string) => {
		try {
			const { data } = await $axios.get<{ success: boolean; options: any }>("/users/add-authn");

			const attResp = await startRegistration(data.options);

			const { data: verification } = await $axios.post<{ success: boolean; authn: Authn }>("/users/verify-authn", JSON.stringify({ attResp, device }));

			if (verification.success) {
				savedDevices.value.push(verification.authn);
				return { success: true, message: "Device registered successfully" };
			} else {
				return { success: false, message: "Something went wrong, please try again" };
			}
		} catch (err) {
			const error = err as any;
			if (error.code === "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED") {
				return { success: false, message: "Device already registered." };
			} else {
				return { success: false, message: "Something went wrong, please try again" };
			}
		}
	};

	const loginWithAuthn = async (email: string) => {
		const response = await $fetch<{ success: boolean; options: any }>(`${import.meta.env.VITE_API_URL}/auth/request-authn-login`, {
			method: "POST",
			body: JSON.stringify({ email }),
		});
		const attResp = await startAuthentication(response.options);
		const auth = await $fetch<TokenAPIResponse>(`${import.meta.env.VITE_API_URL}/auth/authn-login`, {
			method: "POST",
			body: JSON.stringify({ email, attResp }),
		});

		if (auth.success) return auth;
		else throw new Error("Something went wrong");
	};

	const removeAuthn = async (id: string) => {
		try {
			const { data } = await $axios.post<{ success: boolean }>("/users/remove-authn", JSON.stringify({ id }));

			if (data.success) {
				savedDevices.value = savedDevices.value.filter((d) => d._id !== id);
				push.success("Device removed successfully");
			} else throw new Error("Something went wrong");
		} catch (error) {
			push.error("Device could not be removed. Please try again.");
		}
	};

	onMounted(() => {
		isAuthnSupported.value = browserSupportsWebAuthn();
	});

	return {
		isAuthnSupported,
		getAuthns,
		addAuthn,
		removeAuthn,
		loginWithAuthn,
	};
};
