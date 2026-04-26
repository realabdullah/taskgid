type GoSequence = "" | "g"

const SEQUENCE_TIMEOUT_MS = 900

function isTypingTarget (target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) {
		return false
	}

	const tag = target.tagName.toLowerCase()
	return target.isContentEditable || tag === "input" || tag === "textarea" || tag === "select"
}

export default defineNuxtPlugin(() => {
	const route = useRoute()
	const commandPaletteOpen = useState<boolean>("command-palette-open", () => false)
	const keyboardShortcutsOpen = useState<boolean>("keyboard-shortcuts-open", () => false)

	let sequence: GoSequence = ""
	let sequenceTimeout: ReturnType<typeof setTimeout> | null = null

	const clearSequence = () => {
		sequence = ""
		if (sequenceTimeout) {
			clearTimeout(sequenceTimeout)
			sequenceTimeout = null
		}
	}

	const closeOverlayIntent = () => {
		window.dispatchEvent(new CustomEvent("taskgid:close-overlay-intent"))
	}

	const onKeydown = async (event: KeyboardEvent) => {
		const key = event.key.toLowerCase()
		const hasModifier = event.metaKey || event.ctrlKey
		const isTyping = isTypingTarget(event.target)

		if (hasModifier && key === "k") {
			event.preventDefault()
			commandPaletteOpen.value = true
			clearSequence()
			return
		}

		if (key === "escape") {
			if (commandPaletteOpen.value) {
				commandPaletteOpen.value = false
			}
			if (keyboardShortcutsOpen.value) {
				keyboardShortcutsOpen.value = false
			}
			closeOverlayIntent()
			clearSequence()
			return
		}

		if (isTyping) {
			return
		}

		if (key === "?") {
			event.preventDefault()
			keyboardShortcutsOpen.value = true
			clearSequence()
			return
		}

		if (key === "g") {
			event.preventDefault()
			sequence = "g"
			if (sequenceTimeout) {
				clearTimeout(sequenceTimeout)
			}
			sequenceTimeout = setTimeout(() => {
				clearSequence()
			}, SEQUENCE_TIMEOUT_MS)
			return
		}

		if (sequence === "g") {
			const slug = (() => {
				const s = route.params.slug
				if (typeof s === "string" && s.length > 0) return s
				return useWorkspacesStore().workspaces?.[0]?.slug ?? ""
			})()
			if (key === "t") {
				event.preventDefault()
				if (slug) {
					await navigateTo(`/app/workspaces/${slug}/tasks`)
				}
			}
			if (key === "m") {
				event.preventDefault()
				if (slug) {
					await navigateTo(`/app/workspaces/${slug}/team`)
				}
			}
			if (key === "s") {
				event.preventDefault()
				if (slug) {
					await navigateTo(`/app/workspaces/${slug}/settings`)
				}
			}
			clearSequence()
			return
		}

		if (key === "c" && route.path.includes("/tasks")) {
			event.preventDefault()
			window.dispatchEvent(new CustomEvent("taskgid:new-task-intent"))
			return
		}

		if (key === "j" || key === "k") {
			event.preventDefault()
			window.dispatchEvent(new CustomEvent("taskgid:task-row-nav", { detail: { direction: key } }))
			return
		}

		if (key === "enter") {
			window.dispatchEvent(new CustomEvent("taskgid:open-focused-task-intent"))
		}
	}

	window.addEventListener("keydown", onKeydown)

	if (import.meta.hot) {
		import.meta.hot.dispose(() => {
			window.removeEventListener("keydown", onKeydown)
		})
	}
})
