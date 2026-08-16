/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDateFormat, formatTimeAgo } from "@vueuse/core";
import type { Task } from "~/types";

export const getInitials = (first?: string, second?: string): string => `${first?.[0]?.toUpperCase() || ""}${second?.[0]?.toUpperCase() || ""}`;

export const getTimeAgo = (date: Date) => formatTimeAgo(new Date(date));

export const formatDate = (val: any, format = "MMMM YYYY") => (val ? useDateFormat(val, format).value : "Not set");

export const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const mb = k * k;

	if (bytes < mb) {
		const sizeInKB = bytes / k;
		return `${sizeInKB.toFixed(1)} KB`;
	} else {
		const sizeInMB = bytes / mb;
		return `${sizeInMB.toFixed(1)} MB`;
	}
};

export const getStatusIcon = (status: Task["status"]) => {
	switch (status) {
		case "done":
			return { icon: "hugeicons:checkmark-circle-01", class: "text-status-done" };
		case "in_progress":
			return { icon: "hugeicons:clock-01", class: "text-status-in-progress" };
		default:
			return { icon: "hugeicons:clock-01", class: "text-status-todo" };
	}
};

export const getPriorityColor = (priority: Task["priority"]) => {
	switch (priority) {
		case "high":
			return "bg-priority-high/10 text-priority-high hover:bg-priority-high/20";
		case "medium":
			return "bg-priority-medium/10 text-priority-medium hover:bg-priority-medium/20";
		case "low":
			return "bg-priority-low/10 text-priority-low hover:bg-priority-low/20";
		default:
			return "";
	}
};

export const getStatusColor = (status: Task["status"]) => {
	switch (status) {
		case "done":
			return "bg-status-done-bg text-status-done hover:brightness-95";
		case "in_progress":
			return "bg-status-in-progress-bg text-status-in-progress hover:brightness-95";
		default:
			return "bg-status-todo-bg text-status-todo hover:brightness-95";
	}
};

export const highlightMentions = (text: string): string => {
	return text.replace(/@(\w+)/g, "<span class='font-bold underline'>@$1</span>");
};

/**
 * Extracts a human-readable error message from any thrown value.
 * Handles: Error instances (including H3Error / FetchError from ofetch),
 * plain strings, and unknown shapes.
 */
export const getServerError = (error: unknown, fallback = "Unable to complete this action. Try again."): string => {
	if (!error) return fallback;
	if (typeof error === "string") return error.trim() || fallback;
	if (error instanceof Error && error.message) return error.message;
	return fallback;
};
