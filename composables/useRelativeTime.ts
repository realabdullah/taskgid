import { formatTimeAgo } from "@vueuse/core";

export const useRelativeTime = (value: string | Date | number) => {
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "Unknown";
	}
	return formatTimeAgo(date);
};
