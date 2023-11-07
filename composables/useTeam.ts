export const useTeam = () => {
	const { $axios } = useNuxtApp();
	const { teams } = storeToRefs(useStore());

	const route = useRoute();

	const fetchTeams = async () => {
		try {
			const { data } = await $axios.get<TeamsAPIResponse>(`/teams/${route.params.workspace}`);
			if (!data.success) throw new Error("Something went wrong");
			teams.value = [...data.team];
		} catch (error) {
			const { code, message } = formatError(error);
			throw createError({
				statusCode: code,
				statusMessage: message,
			});
		}
	};

	return { fetchTeams };
};
