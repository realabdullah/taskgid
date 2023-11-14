export default defineNuxtRouteMiddleware(async (to) => {
	const { $axios } = useNuxtApp();

	const token = computed(() => to.params.token);

	try {
		if (!token.value) throw new Error("Invalid token");
		const { data } = await $axios.post<{ success: boolean; isNew: boolean }>("/invite/accept/", { token: token.value });

		if (!data.success) throw new Error("Invalid token");

		if (data.isNew) navigateTo(`/signup?token=${token.value}`);
		else navigateTo("/login");
	} catch (error) {
		throw createError({
			statusMessage: (error as any).response.data.message,
			statusCode: 400,
		});
	}
});
