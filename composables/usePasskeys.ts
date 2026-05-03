/* eslint-disable @typescript-eslint/no-explicit-any */
import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { toast } from "vue-sonner";
import type { GetAuthnOptions, LoginResponse, Passkey } from "../types";

const CHALLENGE_TIMEOUT = 60_000;

const getErrorMessage = (error: unknown) => {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "object" && error !== null) {
		const maybeError = error as { data?: { error?: string; message?: string }; message?: string };
		return maybeError.data?.error || maybeError.data?.message || maybeError.message || "An unexpected error occurred";
	}
	return "An unexpected error occurred";
};

const withChallengeTimeout = async <T>(operation: Promise<T>, timeoutMessage: string): Promise<T> => {
	let timeoutId: ReturnType<typeof setTimeout>;
	try {
		return await Promise.race([
			operation,
			new Promise<T>((_, reject) => {
				timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), CHALLENGE_TIMEOUT);
			}),
		]);
	} finally {
		clearTimeout(timeoutId!);
	}
};

export const usePasskeys = () => {
	const passkeys = ref<Passkey[]>([]);
	const addingPasskey = ref(false);

	const handleAddPasskey = async () => {
		try {
			if (addingPasskey.value) return;
			addingPasskey.value = true;

			const { success, error, options } = await useApiFetch<{ options: GetAuthnOptions; success: boolean; error?: string }>(API_ENDPOINTS.users.authnOptions, { method: "GET" });
			if (!success || !options || error) throw new Error(error || "Failed to get options for registering passkey");

			const attResp = await withChallengeTimeout(startRegistration({ optionsJSON: options as any }), "Passkey registration timed out after 60 seconds. Please try again.");
			if (!attResp) throw new Error("Failed to register passkey");

			const res = await useApiFetch<{ success: boolean; error?: string }>(API_ENDPOINTS.users.authnVerify, {
				method: "POST",
				body: { ...attResp },
			});

			if (!res.success || res.error) throw new Error(res.error || "Failed to register passkey");

			await refreshNuxtData("passkeys");
			toast.success("Passkey registered successfully.");
			addingPasskey.value = false;
		} catch (error) {
			addingPasskey.value = false;
			toast.error(getErrorMessage(error));
		}
	};

	const handleRemovePasskey = async (passkey: Passkey) => {
		if (!passkey || !passkey.id || passkeys.value?.length === 0) return false;

		try {
			const res = await useApiFetch<{ success: boolean; error?: string }>(API_ENDPOINTS.users.authnById(passkey.id), {
				method: "DELETE",
			});

			if (!res?.success || res.error) {
				throw new Error(res?.error || "Failed to remove passkey");
			}

			passkeys.value = passkeys.value?.filter((p) => p.id !== passkey.id) || [];
			await refreshNuxtData("passkeys");
			toast.success("Passkey removed successfully.");
			return true;
		} catch (error) {
			toast.error(getErrorMessage(error));
			return false;
		}
	};

	const loginWithPasskey = async (email: string) => {
		const { success, error, options } = await useApiFetch<{ options: GetAuthnOptions; success: boolean; error?: string }>(API_ENDPOINTS.auth.passkeyRequestLogin, {
			method: "POST",
			body: { email },
		});
		if (!success || !options || error) throw new Error(error || "Failed to get options for registering passkey");

		const attResp = await withChallengeTimeout(startAuthentication({ optionsJSON: options as any }), "Passkey login timed out after 60 seconds. Please try again.");
		if (!attResp) throw new Error("Failed to process passkey");

		const data = await useApiFetch<LoginResponse>(API_ENDPOINTS.auth.passkeyLogin, { method: "POST", body: { ...attResp } });
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
