type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "taskgid-theme";

const applyTheme = (_theme: Theme) => {
	if (typeof document === "undefined") return;
	document.documentElement.classList.remove("dark");
	document.documentElement.setAttribute("data-theme", "light");
};

export const useTheme = () => {
	const theme = useState<Theme>("theme", () => "light");

	const setTheme = (value: Theme) => {
		theme.value = value;
		localStorage.setItem(STORAGE_KEY, value);
		applyTheme(value);
	};

	const initTheme = () => {
		const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
		const resolved: Theme = stored ?? "light";
		theme.value = resolved;
		applyTheme(resolved);
	};

	return { theme, setTheme, initTheme };
};
