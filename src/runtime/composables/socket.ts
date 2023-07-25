import { NuxtApp, useNuxtApp } from '#app'
export const useClientSocketIo = () => useNuxtApp().$socket as NuxtApp['$socket']
