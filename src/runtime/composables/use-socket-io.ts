import { useNuxtApp } from '#app'
import type { Socket } from 'socket.io-client'

export const useSocketIO = () => {
  const nuxt = useNuxtApp()
  return nuxt.$io as Socket
}
