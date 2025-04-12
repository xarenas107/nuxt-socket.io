import type { NuxtApp } from '#app'
import { defineNuxtPlugin, useSocketIOStore } from '#imports'
declare module 'pinia' {
  interface PiniaCustomProperties {
    $io: NuxtApp['$io']
  }
}

export default defineNuxtPlugin({
  setup(nuxt){
    nuxt.hook('io:done', (socket, options) => {
      const store = useSocketIOStore()

      // Handle status with events
      socket.on('connect',() => {
        store.id = socket.id || ''
        store.transport = socket.io.engine.transport.name
        store.status.error = null
        store.status.connected = true
        store.status.pending = false
        store.status.active = true

        socket.io.engine.on('upgrade', (response) => {
          store.transport = response.name
        })
      })

      socket.on('connect_error', (error) => {
        store.status.error = error
        store.status.connected = false
        store.status.pending = socket.active
        store.transport = undefined
      })

      socket.io.on('reconnect_failed', () => {
        store.status.connected = store.status.pending = false
        store.transport = undefined
        store.status.active = false
      })

      socket.on('disconnect', () => {
        store.status.connected = store.status.pending = false
        store.transport = undefined
      })

      // Connect on client side only
      if (options?.autoConnect) {
        store.status.pending = store.status.active = true
        if (import.meta.client) socket.connect()
      }
    })
  }
})
