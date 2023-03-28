// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	css: ["~/assets/scss/main.scss"],
	modules: ["@nuxtjs/supabase", "@pinia/nuxt"],
	devServer: {
		port: 1234,
	},
});
