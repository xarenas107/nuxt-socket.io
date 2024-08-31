export default defineNuxtConfig({
  modules: ['../src/module', '@pinia/nuxt'],
  compatibilityDate: '2024-08-15',
  devtools: { enabled: true },
  nitro: {
    experimental: {
      websocket: true,
    }
  },
  future: {
		compatibilityVersion: 4,
	},
  io: {}
})
