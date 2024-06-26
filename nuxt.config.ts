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
				propsDestructure: true,
			},
		},
	},
	imports: {
		dirs: ["store"],
	},
	devServer: {
		port: 1234,
	},
	notivue: {
		position: "top-right",
	},
});
