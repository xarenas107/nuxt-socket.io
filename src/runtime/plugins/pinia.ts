import type { NuxtApp } from '#app'
import { defineNuxtPlugin } from '#imports'

declare module 'pinia' {
  interface PiniaCustomProperties {
    $io: NuxtApp['$io']
  }
}

export default defineNuxtPlugin({
  dependsOn:['pinia', 'nuxt-socket.io'],
  setup(nuxt){
    (nuxt?.$pinia as any)?.use(() => ({ '$io':nuxt.$io }))
  }
})
