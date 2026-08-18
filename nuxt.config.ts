import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	modules: ["@nuxt/eslint", "@nuxt/icon", "@nuxt/image", "@nuxt/scripts", "shadcn-nuxt", "@vueuse/nuxt", "@formkit/auto-animate/nuxt", "@pinia/nuxt", "@nuxt/fonts"],
	ssr: false,
	devtools: { enabled: false },
	app: {
		head: {
			htmlAttrs: { lang: "en" },
			charset: "utf-8",
			viewport: "width=device-width, initial-scale=1",
			// Pre-hydration default; app.vue swaps in the page's own title once mounted.
			title: "Taskgid — every task keeps its own record",
			link: [
				{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
				{ rel: "alternate icon", href: "/favicon.ico", sizes: "48x48" },
				{ rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
				{ rel: "manifest", href: "/site.webmanifest" },
			],
			meta: [
				{ name: "viewport", content: "width=device-width, initial-scale=1" },
				{ name: "description", content: "A task workspace for small product teams. Owners, due dates, discussion and the full history, kept on the task itself." },
				{ name: "author", content: "Taskgid" },
				{ name: "keywords", content: "Taskgid, product team, task management, team execution, project coordination" },
				{ name: "theme-color", content: "#f9f8f5" },
				{ property: "og:site_name", content: "Taskgid" },
				{ property: "og:title", content: "Taskgid — every task keeps its own record" },
				{ property: "og:description", content: "A task workspace for small product teams. Owners, due dates, discussion and the full history, kept on the task itself." },
				{ property: "og:type", content: "website" },
				{ property: "og:url", content: "https://tasks.abdspace.xyz" },
				{ property: "og:image", content: "https://tasks.abdspace.xyz/og.png" },
				{ property: "og:image:width", content: "1200" },
				{ property: "og:image:height", content: "630" },
				{ property: "og:image:alt", content: "Taskgid — every task keeps its own record" },
				{ name: "twitter:card", content: "summary_large_image" },
				{ name: "twitter:title", content: "Taskgid — every task keeps its own record" },
				{ name: "twitter:description", content: "A task workspace for small product teams. Owners, due dates, discussion and the full history, kept on the task itself." },
				{ name: "twitter:image", content: "https://tasks.abdspace.xyz/og.png" },
			],
		},
	},
	css: ["~/assets/css/tailwind.css", "./node_modules/@novu/js/dist/index.css"],
	runtimeConfig: {
		public: {
			apiBaseUrl: process.env.API_BASE_URL || "http://localhost:8000",
		},
	},
	build: {
		transpile: ["@vuepic/vue-datepicker"],
	},
	devServer: { port: 3000 },
	compatibilityDate: "2025-04-26",
	vite: { plugins: [tailwindcss()] },
	eslint: { config: { stylistic: true }, checker: true },
	fonts: { families: [] },
	shadcn: {
		/**
		 * Prefix for all the imported component
		 */
		prefix: "",
		/**
		 * Directory that the component lives in.
		 * @default "./components/ui"
		 */
		componentDir: "./components/ui",
	},
});
