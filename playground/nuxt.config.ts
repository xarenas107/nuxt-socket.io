export default defineNuxtConfig({
  modules: ['../src/module', '@pinia/nuxt'],
  imports: {
    autoImport: true,
  },
  compatibilityDate: 'latest',
  io: {},
})
