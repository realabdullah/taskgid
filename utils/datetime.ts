import { useStore } from "~/stores";

/**
 * Dates, resolved against the user's own timezone rather than the browser's.
 *
 * "Overdue" and "today" have to mean the same thing to a user in Lagos and one
 * in Berlin, and the same thing the server decided when it sent them a digest.
 */

/** The user's stored zone, falling back to the browser's, then UTC. */
export const resolveTimezone = (explicit?: string) => {
	if (explicit) return explicit;
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
	} catch {
		return "UTC";
	}
};

/** `YYYY-MM-DD` for an instant, as seen in the given timezone. */
export const toLocalDateKey = (value: Date | string, timezone?: string) => {
	const date = typeof value === "string" ? new Date(value) : value;
	try {
		// en-CA formats as YYYY-MM-DD, which sorts and compares correctly.
		return new Intl.DateTimeFormat("en-CA", { timeZone: resolveTimezone(timezone), year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
	} catch {
		return date.toISOString().slice(0, 10);
	}
};

/** Today's date key in the user's timezone. */
export const todayKey = (timezone?: string) => toLocalDateKey(new Date(), timezone);

/** Adds whole days to a date key without leaving the user's calendar. */
export const addDaysToKey = (key: string, days: number) => {
	const [year, month, day] = key.split("-").map(Number);
	const date = new Date(Date.UTC(year, month - 1, day));
	date.setUTCDate(date.getUTCDate() + days);
	return date.toISOString().slice(0, 10);
};

/** A task is overdue when its due date fell before today, in the user's zone. */
export const isOverdueIn = (dueDate: string | null, timezone?: string) => {
	if (!dueDate) return false;
	return toLocalDateKey(dueDate, timezone) < todayKey(timezone);
};

export const isDueTodayIn = (dueDate: string | null, timezone?: string) => {
	if (!dueDate) return false;
	return toLocalDateKey(dueDate, timezone) === todayKey(timezone);
};

/** Reads the signed-in user's timezone reactively. */
export const useUserTimezone = () => {
	const { user } = storeToRefs(useStore());
	return computed(() => resolveTimezone(user.value?.timezone ?? undefined));
};
