export default defineNuxtRouteMiddleware(async (to) => {
	if (process.client) {
		const { $axios } = useNuxtApp();

		const token = computed(() => to.params.token);

		try {
			if (!token.value) throw new Error("Invalid token");
			const { data } = await $axios.post<{ success: boolean; isNew: boolean }>("/invite/accept/", { token: token.value });

			if (!data.success) throw new Error("Invalid token");

			if (data.isNew) window.location.href = `/signup?token=${token.value}`;
			else window.location.href = "/login";
		} catch (error) {
			throw createError({
				statusMessage: (error as any).response.data.message,
				statusCode: 400,
			});
		}
	}
});
