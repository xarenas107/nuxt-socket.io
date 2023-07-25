export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  imports: {
    autoImport: true,
    injectAtEnd: true,
  },
})
