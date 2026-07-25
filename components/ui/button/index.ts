import { cva, type VariantProps } from "class-variance-authority";

export { default as Button } from "./Button.vue";

export const buttonVariants = cva(
	"interactive inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm font-semibold leading-none text-sm text-text-primary disabled:pointer-events-none disabled:opacity-45 disabled:text-current [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
	{
		variants: {
			variant: {
				primary: "bg-primary text-primary-foreground shadow-xs hover:bg-accent-hover",
				secondary: "border border-border bg-surface-0 text-text-primary hover:border-border-strong hover:bg-surface-2",
				ghost: "bg-transparent text-text-secondary hover:bg-surface-2 hover:text-text-primary",
				destructive: "bg-danger text-destructive-foreground shadow-xs hover:brightness-95",

				default: "bg-primary text-primary-foreground shadow-xs hover:bg-accent-hover",
				outline: "border border-border bg-surface-0 text-text-primary hover:border-border-strong hover:bg-surface-2",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				sm: "h-8 px-3 text-sm",
				md: "h-9 px-4 text-sm",
				lg: "h-10 px-5 text-sm",
				icon: "h-8 w-8 p-0",
				default: "h-9 px-4 text-sm",
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "md",
		},
	}
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
