import type { Task } from "~/types";

export type RecurrenceFrequency = "daily" | "weekly" | "monthly";

/**
 * The subset of RFC 5545 this editor writes.
 *
 * Deliberately narrower than RRULE: daily, weekly on chosen weekdays, and
 * monthly on a day of the month, with an optional stop after N occurrences.
 * The stored format is still a full rule string, so a schedule authored
 * elsewhere — or in a calendar client — keeps working even though this form
 * cannot express it.
 */
export type RecurrenceDraft = {
	frequency: RecurrenceFrequency;
	interval: number;
	/** RFC 5545 weekday codes, weekly only. */
	weekdays: string[];
	/** Day of month, monthly only. */
	monthDay: number;
	/** Local wall-clock time the instance is due, as "HH:MM". */
	time: string;
	/** Date the schedule starts, as "YYYY-MM-DD". */
	startDate: string;
	/** Stop after this many occurrences; 0 means never stop. */
	count: number;
};

export const WEEKDAYS = [
	{ code: "MO", label: "Mon" },
	{ code: "TU", label: "Tue" },
	{ code: "WE", label: "Wed" },
	{ code: "TH", label: "Thu" },
	{ code: "FR", label: "Fri" },
	{ code: "SA", label: "Sat" },
	{ code: "SU", label: "Sun" },
] as const;

const pad = (value: number) => String(value).padStart(2, "0");

export const defaultDraft = (): RecurrenceDraft => {
	const now = new Date();
	return {
		frequency: "weekly",
		interval: 1,
		weekdays: [WEEKDAYS[(now.getDay() + 6) % 7].code],
		monthDay: now.getDate(),
		time: "09:00",
		startDate: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
		count: 0,
	};
};

/**
 * Render a draft as the rule string the API stores.
 *
 * DTSTART is always written. A rule parsed without one takes its time-of-day
 * from the moment of parsing, so occurrence times would drift every time the
 * spawner ran.
 */
export const draftToRrule = (draft: RecurrenceDraft): string => {
	const [hours, minutes] = draft.time.split(":").map(Number);
	const start = new Date(`${draft.startDate}T00:00:00`);
	start.setHours(hours || 0, minutes || 0, 0, 0);

	// DTSTART is written in UTC, so the instant is unambiguous wherever the
	// spawner runs. The zone the user chose travels separately on the rule.
	const dtstart = [start.getUTCFullYear(), pad(start.getUTCMonth() + 1), pad(start.getUTCDate()), "T", pad(start.getUTCHours()), pad(start.getUTCMinutes()), "00Z"].join("");

	const parts = [`FREQ=${draft.frequency.toUpperCase()}`];
	if (draft.interval > 1) parts.push(`INTERVAL=${draft.interval}`);
	if (draft.frequency === "weekly" && draft.weekdays.length) parts.push(`BYDAY=${draft.weekdays.join(",")}`);
	if (draft.frequency === "monthly") parts.push(`BYMONTHDAY=${draft.monthDay}`);
	if (draft.count > 0) parts.push(`COUNT=${draft.count}`);

	return `DTSTART:${dtstart}\nRRULE:${parts.join(";")}`;
};

/** A plain-language reading of a rule, for people who do not write RRULE. */
export const describeRule = (rrule: string): string => {
	const body = rrule.split("RRULE:")[1] ?? rrule;
	const fields = Object.fromEntries(
		body
			.split(";")
			.map((part) => part.split("="))
			.filter((pair) => pair.length === 2)
	) as Record<string, string>;

	const interval = Number(fields.INTERVAL ?? 1);
	const every = interval > 1 ? `every ${interval} ` : "every ";

	let base: string;
	switch ((fields.FREQ ?? "").toUpperCase()) {
		case "DAILY":
			base = `${every}${interval > 1 ? "days" : "day"}`;
			break;
		case "WEEKLY": {
			const days = (fields.BYDAY ?? "")
				.split(",")
				.map((code) => WEEKDAYS.find((day) => day.code === code)?.label)
				.filter(Boolean);
			base = `${every}${interval > 1 ? "weeks" : "week"}${days.length ? ` on ${days.join(", ")}` : ""}`;
			break;
		}
		case "MONTHLY":
			base = `${every}${interval > 1 ? "months" : "month"}${fields.BYMONTHDAY ? ` on day ${fields.BYMONTHDAY}` : ""}`;
			break;
		default:
			return rrule;
	}

	return fields.COUNT ? `${base}, ${fields.COUNT} times` : base;
};

/** Whether a task was produced by a schedule. */
export const isRecurringInstance = (task: Task) => Boolean(task.recurrenceId);
