import { toast } from "vue-sonner";
import { toTaskQuery, type TaskFilters } from "./useTaskFilters";

/**
 * Exports the current filter set.
 *
 * The endpoints need the Authorization header, so a plain link cannot fetch
 * them — the response comes back as a blob and is handed to the browser.
 *
 * Note the PDF endpoint sends HTML with a `.html` filename rather than a PDF,
 * so it is presented as a print view and the browser does the PDF part.
 */
export const useTaskExport = (workspaceSlug: MaybeRefOrGetter<string>, filters: MaybeRefOrGetter<TaskFilters>) => {
	const config = useRuntimeConfig();
	const authToken = useCookie<string | undefined>("TG-AUTHTOKEN");
	const isExporting = ref(false);

	const request = async (format: "csv" | "pdf") => {
		const slug = toValue(workspaceSlug);
		if (!slug) return null;

		const query = new URLSearchParams(Object.entries(toTaskQuery(toValue(filters))).map(([key, value]) => [key, String(value)]));
		const url = `${config.public.apiBaseUrl}${API_ENDPOINTS.workspaces.taskExport(slug, format)}?${query}`;

		const response = await fetch(url, {
			headers: { Accept: "*/*", "ngrok-skip-browser-warning": "ignore", ...(authToken.value ? { Authorization: `Bearer ${authToken.value}` } : {}) },
		});
		if (!response.ok) throw new Error(`Export failed (${response.status}).`);
		return response.blob();
	};

	const downloadCsv = async () => {
		try {
			isExporting.value = true;
			const blob = await request("csv");
			if (!blob) return;
			const href = URL.createObjectURL(blob);
			const link = Object.assign(document.createElement("a"), { href, download: `${toValue(workspaceSlug)}-tasks.csv` });
			document.body.appendChild(link);
			link.click();
			link.remove();
			URL.revokeObjectURL(href);
			toast.success("Export downloaded.");
		} catch (error) {
			toast.error(getServerError(error));
		} finally {
			isExporting.value = false;
		}
	};

	/** Opens the server's HTML rendering and triggers the browser's own print dialog. */
	const openPrintView = async () => {
		try {
			isExporting.value = true;
			const blob = await request("pdf");
			if (!blob) return;
			const href = URL.createObjectURL(new Blob([blob], { type: "text/html" }));
			const printWindow = globalThis.window.open(href, "_blank");
			if (!printWindow) {
				toast.error("Allow pop-ups to open the print view.");
				URL.revokeObjectURL(href);
				return;
			}
			printWindow.addEventListener("load", () => {
				printWindow.print();
				URL.revokeObjectURL(href);
			});
		} catch (error) {
			toast.error(getServerError(error));
		} finally {
			isExporting.value = false;
		}
	};

	return { downloadCsv, isExporting, openPrintView };
};
