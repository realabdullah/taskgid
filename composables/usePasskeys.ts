/* eslint-disable @typescript-eslint/no-explicit-any */
import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import { toast } from "vue-sonner";
import type { GetAuthnOptions, LoginResponse, Passkey } from "../types";

export const usePasskeys = () => {
	const passkeys = ref<Passkey[]>([]);
	const addingPasskey = ref(false);

	const handleAddPasskey = async () => {
		try {
			if (addingPasskey.value) return;
			addingPasskey.value = true;

			const { success, error, options } = await useApiFetch<{ options: GetAuthnOptions; success: boolean; error?: string }>("/users/authn/options", { method: "GET" });
			if (!success || !options || error) throw new Error(error || "Failed to get options for registering passkey");

			const attResp = await startRegistration({ optionsJSON: options as any });
			if (!attResp) throw new Error("Failed to register passkey");

			const res = await useApiFetch<{ success: boolean; error?: string }>("/users/authn/verify", {
				method: "POST",
				body: { ...attResp },
			});

			if (!res.success || res.error) throw new Error(error || "Failed to register passkey");

			await refreshNuxtData("passkeys");
			addingPasskey.value = false;
		} catch (error) {
			addingPasskey.value = false;
			toast(String(error));
		}
	};

	const handleRemovePasskey = (passkey: Passkey) => {
		if (!passkey || passkeys.value?.length === 0) return;
		passkeys.value = passkeys.value?.filter((p) => p.id !== passkey.id) || [];
	};

	const loginWithPasskey = async (email: string) => {
		const { success, error, options } = await useApiFetch<{ options: GetAuthnOptions; success: boolean; error?: string }>("/auth/authn/request-login", { method: "POST", body: { email } });
		if (!success || !options || error) throw new Error(error || "Failed to get options for registering passkey");

		const attResp = await startAuthentication({ optionsJSON: options as any });
		if (!attResp) throw new Error("Failed to process passkey");

		const data = await useApiFetch<LoginResponse>("/auth/authn/login", { method: "POST", body: { ...attResp } });
		return data;
	};

	return {
		passkeys,
		addingPasskey,
		handleAddPasskey,
		handleRemovePasskey,
		loginWithPasskey,
	};
};
