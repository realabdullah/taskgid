/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDateFormat, formatTimeAgo } from "@vueuse/core";

export const getInitials = (first?: string, second?: string): string => `${first?.[0]?.toUpperCase() || ""}${second?.[0]?.toUpperCase() || ""}`;

export const getTimeAgo = (date: Date) => formatTimeAgo(new Date(date));

export const formatDate = (val: any, format = "MMMM YYYY") => (val ? useDateFormat(val, format) : "Nil");
