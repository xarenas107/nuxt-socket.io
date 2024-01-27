import type { NuxtApp } from '#app'

declare module 'pinia' {
  interface PiniaCustomProperties {
    $io: NuxtApp['$io']
  }
}

export default defineNuxtPlugin(nuxt => {
	extendSocketIO(socket => {
		(nuxt?.$pinia as any)?.use(() => ({ '$io':socket }))
	})
})
