export default defineNuxtConfig({
  modules: ['../src/module', '@pinia/nuxt'],
  compatibilityDate: '2024-08-04',
  devtools: { enabled: true },
  "socket.io":{
    pinia:true
  },
  nitro: {
    experimental: {
      websocket: true,
    }
  },
  imports: {
    autoImport: true,
    injectAtEnd: true,
  },
})
