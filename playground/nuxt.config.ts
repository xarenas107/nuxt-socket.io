export default defineNuxtConfig({
  modules: ['../src/module', '@pinia/nuxt'],
  devtools: { enabled: true },
  "socket.io":{
    pinia:true
  },
  imports: {
    autoImport: true,
    injectAtEnd: true,
  },
})
