// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    css: ["~/assets/scss/main.scss"],
    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `@import "@/assets/scss/_variables.scss"; @import "@/assets/scss/_functions.scss";`
                }
            }
        }
    }
})
