// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: { enabled: true },
	modules: ["@nuxt/ui", "@pinia/nuxt"],
	nitro: {
		compressPublicAssets: {
			gzip: true,
			brotli: true,
		},
	},
});
