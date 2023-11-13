// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	css: ["~/assets/scss/main.scss", "notivue/notifications.css", "notivue/animations.css"],
	modules: ["@pinia/nuxt", "@pinia-plugin-persistedstate/nuxt", "notivue/nuxt"],
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

	runtimeConfig: {
		public: {
			baseUrl: process.env.BASE_URL,
			apiUrl: process.env.API_URL,
		},
	},

	notivue: {
		position: "top-right",
	},
});
