import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'
import { defineNuxtPlugin, useSocketIO } from '#imports'

export default defineNuxtPlugin({
  dependsOn:['nuxt-socket.io'],
  async setup() {
    const options:NitroFetchOptions<NitroFetchRequest> = {
      onRequest: ({ options }) => {
        const socket = useSocketIO()

        if (socket.id) {
          const io = socket?.id
          options.headers = { ...options.headers, io }
        }
      }
    }

    const $fetch = globalThis.$fetch.create(options)
    globalThis.$fetch = $fetch
  }
})
