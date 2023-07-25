import type { NuxtApp } from "#app"

declare module 'pinia' {
    interface PiniaCustomProperties {
      $socket: NuxtApp['$socket']
    }
}
