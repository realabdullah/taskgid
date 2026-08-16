import { cva, type VariantProps } from "class-variance-authority";

export { default as Button } from "./Button.vue";

/*
 * Disabled buttons opt out of the blanket opacity fade that `Pressable` applies
 * (`disabled:opacity-100`) and state their own muted colours instead. Fading a
 * solid button dropped its label below readable contrast against the fill.
 */
const disabledSolid = "disabled:opacity-100 disabled:bg-surface-2 disabled:text-text-disabled disabled:shadow-none";
const disabledQuiet = "disabled:opacity-100 disabled:text-text-disabled";

export const buttonVariants = cva(
	"inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold leading-none text-text-primary [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				primary: `bg-primary text-primary-foreground shadow-xs hover:bg-ink-hover ${disabledSolid}`,
				secondary: `border border-border bg-surface-0 text-text-primary hover:border-border-strong hover:bg-surface-2 ${disabledQuiet} disabled:bg-surface-1`,
				ghost: `bg-transparent text-text-secondary hover:bg-surface-2 hover:text-text-primary ${disabledQuiet}`,
				destructive: `bg-danger text-destructive-foreground shadow-xs hover:brightness-95 ${disabledSolid}`,

				default: `bg-primary text-primary-foreground shadow-xs hover:bg-ink-hover ${disabledSolid}`,
				outline: `border border-border bg-surface-0 text-text-primary hover:border-border-strong hover:bg-surface-2 ${disabledQuiet} disabled:bg-surface-1`,
				link: `text-primary underline-offset-4 hover:underline ${disabledQuiet}`,
			},
			size: {
				sm: "h-8 px-3 text-sm",
				md: "h-9 px-4 text-sm",
				lg: "h-10 px-5 text-sm",
				icon: "h-8 w-8 p-0",
				inline: "h-auto p-0 text-[inherit]",
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
