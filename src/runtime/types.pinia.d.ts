import type { NuxtApp } from "#app"

declare module 'pinia' {
    interface PiniaCustomProperties {
      $socketIO: NuxtApp['$socketIO']
    }
}
