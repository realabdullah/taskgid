// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    css: ["~/assets/scss/main.scss"],
    modules: ["@nuxtjs/supabase", "@pinia/nuxt"],

    imports: {
        dirs: ["store"],
    },

    pinia: {
        autoImports: ["defineStore", "storeToRefs"],
    },

    devServer: {
		port: 1234,
	},
    ssr: false,
});
