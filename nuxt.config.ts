import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	modules: ["@nuxt/eslint", "@nuxt/icon", "@nuxt/image", "@nuxt/scripts", "shadcn-nuxt", "@vueuse/nuxt", "@formkit/auto-animate/nuxt", "@pinia/nuxt", "@nuxt/fonts"],
	ssr: false,
	devtools: { enabled: true },
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
