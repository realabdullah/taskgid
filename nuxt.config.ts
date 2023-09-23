// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	css: ["~/assets/scss/main.scss"],
	modules: ["@nuxtjs/supabase", "@pinia/nuxt", "@pinia-plugin-persistedstate/nuxt"],
	vite: {
		css: {
			preprocessorOptions: {
				scss: {
					additionalData: `
						@import "@/assets/scss/abstracts/_variables.scss"; 
						@import "@/assets/scss/abstracts/_mixins.scss";
					`,
				},
			},
		},
		vue: {
			script: {
				defineModel: true,
				propsDestructure: true,
			},
		},
	},
	imports: {
		dirs: ["store"],
	},

	pinia: {
		autoImports: ["defineStore", "storeToRefs"],
	},

	devServer: {
		port: 1234,
	},
});
