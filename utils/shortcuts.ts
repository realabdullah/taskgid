export type Shortcut = { keys: string; label: string; group: string };

/**
 * The keyboard layer, as documented to the user.
 *
 * `plugins/shortcuts.client.ts` binds these; this list is what the `?` sheet
 * renders, so the two are meant to be edited together.
 */
export const SHORTCUTS: Shortcut[] = [
	{ keys: "⌘ K", label: "Open the command palette", group: "General" },
	{ keys: "/", label: "Focus the task search", group: "General" },
	{ keys: "?", label: "Show this shortcut sheet", group: "General" },
	{ keys: "Esc", label: "Close the open overlay", group: "General" },
	{ keys: "c", label: "Create a task", group: "Tasks" },
	{ keys: "j / k", label: "Move between task rows", group: "Tasks" },
	{ keys: "Enter", label: "Open the focused task", group: "Tasks" },
	{ keys: "⌘ ←/→", label: "Move a focused board card", group: "Board" },
	{ keys: "g h", label: "Go home", group: "Navigation" },
	{ keys: "g n", label: "Go to my tasks", group: "Navigation" },
	{ keys: "g t", label: "Go to workspace tasks", group: "Navigation" },
	{ keys: "g b", label: "Go to the board", group: "Navigation" },
	{ keys: "g m", label: "Go to the team", group: "Navigation" },
	{ keys: "g s", label: "Go to workspace settings", group: "Navigation" },
];
