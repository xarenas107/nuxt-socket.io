import { useNuxtApp } from '#app'
import type { Socket } from 'socket.io-client'

export const useSocketIO = () => useNuxtApp().$io as Socket
