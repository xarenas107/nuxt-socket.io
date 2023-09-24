import type { NuxtApp } from '#app'

declare module 'pinia' {
  interface PiniaCustomProperties {
    $socketIO: NuxtApp['$socketIO']
  }
}

export default defineNuxtPlugin(nuxt => {
	extendSocketIO(socket => {
		nuxt?.$pinia?.use(() => ({ '$socketIO':socket }))
	})
})
