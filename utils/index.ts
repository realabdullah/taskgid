/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDateFormat, formatTimeAgo } from "@vueuse/core";

export const getInitials = (first?: string, second?: string): string => `${first?.[0]?.toUpperCase() || ""}${second?.[0]?.toUpperCase() || ""}`;

export const getTimeAgo = (date: Date) => formatTimeAgo(new Date(date));

export const formatDate = (val: any, format = "MMMM YYYY") => (val ? useDateFormat(val, format) : "Nil");

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
