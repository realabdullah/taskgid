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

	runtimeConfig: {
		public: {
			baseUrl: process.env.BASE_URL,
			apiUrl: process.env.API_URL,
			pusherKey: process.env.PUSHER_KEY,
			pusherCluster: process.env.PUSHER_CLUSTER,
			knockKey: process.env.KNOCK_API_KEY,
			knockChannelId: process.env.KNOCK_CHANNEL_ID,
		},
	},

	notivue: {
		position: "top-right",
	},
});
