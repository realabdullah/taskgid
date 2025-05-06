import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	modules: ["@nuxt/eslint", "@nuxt/icon", "@nuxt/image", "@nuxt/scripts", "shadcn-nuxt", "@vueuse/nuxt", "@formkit/auto-animate/nuxt", "@pinia/nuxt", "@nuxt/fonts"],
	ssr: false,
	devtools: { enabled: true },
	app: {
		head: {
			charset: "utf-8",
			viewport: "width=device-width, initial-scale=1",
			title: "TaskGid — Organize Work. Get Things Done.",
			meta: [
				{ name: "viewport", content: "width=device-width, initial-scale=1" },
				{ name: "description", content: "Stay on top of your work. View and manage tasks, priorities, and progress in your TaskGid dashboard." },
				{ name: "author", content: "TaskGid" },
				{ name: "keywords", content: "task dashboard, task manager, team collaboration, project tracking, productivity, TaskGid" },
				{ name: "theme-color", content: "#ffffff" },
				{ property: "og:title", content: "TaskGid — Organize Work. Get Things Done." },
				{ property: "og:description", content: "Plan, assign, and complete tasks effortlessly. TaskGid keeps your team aligned and focused." },
				{ property: "og:type", content: "website" },
				{ property: "og:url", content: "https://tasks.abdspace.xyz" },
				{ name: "twitter:title", content: "TaskGid — Organize Work. Get Things Done." },
				{ name: "twitter:description", content: "Collaborate, assign, and track tasks easily with TaskGid." },
			],
		},
	},
	css: ["~/assets/css/tailwind.css"],
	runtimeConfig: { public: { apiBaseUrl: process.env.API_BASE_URL || "http://localhost:8000" } },
	compatibilityDate: "2025-04-26",
	vite: { plugins: [tailwindcss()] },
	eslint: { config: { stylistic: true }, checker: true },
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
