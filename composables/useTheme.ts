type Theme = "light" | "dark" | "system"

const STORAGE_KEY = "taskgid-theme"

const applyTheme = (theme: Theme) => {
  if (typeof document === "undefined") return
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  document.documentElement.classList.toggle("dark", isDark)
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light")
}

export const useTheme = () => {
  const theme = useState<Theme>("theme", () => "system")

  const setTheme = (value: Theme) => {
    theme.value = value
    localStorage.setItem(STORAGE_KEY, value)
    applyTheme(value)
  }

  const initTheme = () => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    const resolved: Theme = stored ?? "system"
    theme.value = resolved
    applyTheme(resolved)

    // react to OS changes when using system preference
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    mq.addEventListener("change", () => {
      if (theme.value === "system") applyTheme("system")
    })
  }

  return { theme, setTheme, initTheme }
}
