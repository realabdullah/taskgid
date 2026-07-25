import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	modules: ["@nuxt/eslint", "@nuxt/icon", "@nuxt/image", "@nuxt/scripts", "shadcn-nuxt", "@vueuse/nuxt", "@formkit/auto-animate/nuxt", "@pinia/nuxt", "@nuxt/fonts"],
	ssr: false,
	devtools: { enabled: process.env.NODE_ENV === "development" },
	app: {
		head: {
			charset: "utf-8",
			viewport: "width=device-width, initial-scale=1",
			title: "Taskgid — Make the next move obvious.",
			link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
			meta: [
				{ name: "viewport", content: "width=device-width, initial-scale=1" },
				{ name: "description", content: "Taskgid gives product teams a shared signal for what moves next." },
				{ name: "author", content: "Taskgid" },
				{ name: "keywords", content: "Taskgid, product team, task management, team execution, project coordination" },
				{ name: "theme-color", content: "#126c5a" },
				{ property: "og:title", content: "Taskgid — Make the next move obvious." },
				{ property: "og:description", content: "A focused workspace that helps product teams move work forward." },
				{ property: "og:type", content: "website" },
				{ property: "og:url", content: "https://tasks.abdspace.xyz" },
				{ name: "twitter:title", content: "Taskgid — Make the next move obvious." },
				{ name: "twitter:description", content: "A focused workspace that helps product teams move work forward." },
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
	compatibilityDate: "2025-04-26",
	vite: { plugins: [tailwindcss()] },
	eslint: { config: { stylistic: true }, checker: true },
	fonts: {
		families: [{ name: "Manrope", provider: "google", weights: [400, 500, 600, 700, 800] }],
	},
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
