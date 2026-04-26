import { cva, type VariantProps } from "class-variance-authority";

export { default as Badge } from "./Badge.vue";

export const badgeVariants = cva(
	"interactive inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap [&>svg]:size-3 [&>svg]:pointer-events-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
	{
		variants: {
			variant: {
				default: "border-transparent bg-primary text-white [a&]:hover:bg-accent-hover",
				secondary: "border-transparent bg-surface-2 text-text-secondary [a&]:hover:bg-surface-3",
				destructive: "border-transparent bg-danger text-white [a&]:hover:bg-danger/90",
				outline: "border-border bg-surface-0 text-text-primary [a&]:hover:bg-surface-2",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
);
export type BadgeVariants = VariantProps<typeof badgeVariants>;

export { default as BadgePriority } from "./BadgePriority.vue";
export { default as BadgeStatus } from "./BadgeStatus.vue";
