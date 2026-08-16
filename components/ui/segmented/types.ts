export type SegmentedOption<V> = {
	label: string;
	value: V;
	icon?: string;
	/** Optional trailing count, rendered as a tabular-nums pill. */
	count?: number;
};
