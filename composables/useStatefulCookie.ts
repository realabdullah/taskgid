import { useCookie, useState, watch } from "#imports";

export const useStatefulCookie = (name: string) => {
	const cookie = useCookie(name);
	const state = useState(name, () => cookie.value);

	watch(
		state,
		() => {
			cookie.value = state.value;
		},
		{ deep: true },
	);

	return state;
};
