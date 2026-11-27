import { defineNuxtPlugin, useSocketIO } from '#imports'
import type { FetchOptions } from 'nuxt/app'

export default defineNuxtPlugin({
  dependsOn: ['nuxt-socket.io'],
  async setup() {
    const options: FetchOptions = {
      onRequest: ({ options }) => {
        const socket = useSocketIO()

        if (!socket.id) return
        const io = socket?.id
        options.headers.append('io', io)
      },
    }

    const $fetch = globalThis.$fetch.create(options)
    globalThis.$fetch = $fetch
  },
})
