/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FetchOptions } from "ofetch";

export const useApiFetch = <T>(request: string | Request, opts: FetchOptions = {}) => {
	const config = useRuntimeConfig();
	const apiBaseUrl = config.public.apiBaseUrl;
	const authToken = useCookie<string | undefined>("TG-AUTHTOKEN");

	const defaultOptions: FetchOptions = {
		baseURL: apiBaseUrl,
		retry: 1,
		headers: {
			Accept: "application/json",
			"ngrok-skip-browser-warning": "ignore",
			...(String(opts.method)?.toUpperCase() !== "GET" && { "Content-Type": "application/json" }),
			...opts.headers,
		},
		onRequest({ options }) {
			if (authToken.value) {
				options.headers = options.headers || {};
				if (options.headers instanceof Headers) {
					options.headers.set("Authorization", `Bearer ${authToken.value}`);
				} else if (Array.isArray(options.headers)) {
					const authIndex = (options.headers as any[]).findIndex(([key]) => key.toLowerCase() === "authorization");
					if (authIndex !== -1) (options.headers[authIndex][1] as string) = `Bearer ${authToken.value}`;
					else (options.headers as any[]).push(["Authorization", `Bearer ${authToken.value}`]);
				} else (options.headers as Record<string, string>)["Authorization"] = `Bearer ${authToken.value}`;
			}
		},
		onResponseError({ response }) {
			console.error(`API Fetch Response Error (${response.status}):`, response.statusText, response._data);

			const errors = response._data?.errors || response._data?.error || response._data?.message;
			const structuredError = createError({
				statusCode: response.status,
				statusMessage: response.statusText,
				message: typeof errors === "string" ? errors : Array.isArray(errors) ? errors.map((err: any) => err?.message || err).join(", ") : "An unexpected API error occurred",
				fatal: false,
			});

			if (response.status === 401) {
				authToken.value = undefined;
				setTimeout(() => navigateTo("/login"), 50);
			}

			throw structuredError;
		},
		...opts,
	};

	// @ts-ignore
	return $fetch<T>(request, defaultOptions);
};
