/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDateFormat, formatTimeAgo } from "@vueuse/core";
import type { Task } from "~/types";

export const getInitials = (first?: string, second?: string): string => `${first?.[0]?.toUpperCase() || ""}${second?.[0]?.toUpperCase() || ""}`;

export const getTimeAgo = (date: Date) => formatTimeAgo(new Date(date));

export const formatDate = (val: any, format = "MMMM YYYY") => (val ? useDateFormat(val, format).value : "Nil");

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
			return { icon: "hugeicons:checkmark-circle-01", class: "text-green-500" };
		case "in_progress":
			return { icon: "hugeicons:clock-01", class: "text-amber-500" };
		default:
			return { icon: "hugeicons:clock-01", class: "text-slate-500" };
	}
};

export const getPriorityColor = (priority: Task["priority"]) => {
	switch (priority) {
		case "high":
			return "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20";
		case "medium":
			return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20";
		case "low":
			return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
		default:
			return "";
	}
};

export const getStatusColor = (status: Task["status"]) => {
	switch (status) {
		case "done":
			return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
		case "in_progress":
			return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20";
		default:
			return "bg-slate-500/10 text-slate-500 hover:bg-slate-500/20";
	}
};
