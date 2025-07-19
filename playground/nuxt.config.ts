export default defineNuxtConfig({
  modules: ['../src/module', '@pinia/nuxt'],
  compatibilityDate: '2025-07-19',
  devtools: { enabled: false },
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
