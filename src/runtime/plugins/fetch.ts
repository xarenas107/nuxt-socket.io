import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'
import { defineNuxtPlugin, useRuntimeConfig, useSocketIO } from '#imports'

export default defineNuxtPlugin({
  dependsOn:['nuxt-socket.io'],
  async setup() {
    const runtime = useRuntimeConfig()

    const options:NitroFetchOptions<NitroFetchRequest> = {
      baseURL: runtime.app.baseURL,
      onRequest: ({ options }) => {
        const socket = useSocketIO()

        options.headers = {
          ...options.headers,
          'io': socket?.id ?? '',
        }
      }
    }

    const { $fetch } = await import('ofetch')
    globalThis.$fetch = $fetch.create(options)
  }
})
