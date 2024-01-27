import type { NuxtApp } from '#app'
import { defineNuxtPlugin } from '#imports'

declare module 'pinia' {
  interface PiniaCustomProperties {
    $io: NuxtApp['$io']
  }
}

export default defineNuxtPlugin(nuxt => {
	extendSocketIO(io => {
		(nuxt?.$pinia as any)?.use(() => ({ '$io':io }))
	})
})
