import { cva, type VariantProps } from "class-variance-authority";

export { default as Button } from "./Button.vue";

export const buttonVariants = cva(
	"interactive inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium leading-none text-base text-text-primary disabled:pointer-events-none disabled:opacity-100 disabled:text-text-disabled [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
	{
		variants: {
			variant: {
				primary: "bg-primary text-white shadow-xs hover:bg-accent-hover active:scale-[0.98]",
				secondary: "border border-border bg-surface-0 text-text-primary hover:bg-surface-2 active:scale-[0.98]",
				ghost: "bg-transparent text-text-secondary hover:bg-surface-2 hover:text-text-primary active:scale-[0.98]",
				destructive: "bg-danger text-white shadow-xs hover:brightness-95 active:scale-[0.98]",

				default: "bg-primary text-white shadow-xs hover:bg-accent-hover active:scale-[0.98]",
				outline: "border border-border bg-surface-0 text-text-primary hover:bg-surface-2 active:scale-[0.98]",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				sm: "h-8 px-3 text-sm",
				md: "h-9 px-4 text-base",
				lg: "h-10 px-5 text-md",
				icon: "h-8 w-8 p-0",
				default: "h-9 px-4 text-base",
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "md",
		},
	}
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
