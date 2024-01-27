import { io  } from "socket.io-client"
import type { Socket, SocketOptions,ManagerOptions } from "socket.io-client"

export const clientOptions:Partial<SocketOptions & ManagerOptions> = { withCredentials:true }

type SocketIOPlugin = { socket:Socket }

export default defineNuxtPlugin<SocketIOPlugin>(async nuxt => {
  const store = useSocketIOStore()

  await nuxt.hooks.callHook('socket.io:config',clientOptions)

  const { origin } = window.location
	const url = origin.replace('http','ws')
	const socket = io(url,clientOptions)
	window.onbeforeunload = () => { socket.close() }

	await nuxt.hooks.callHook('socket.io:done',socket)

  // Define store and save connection id
  socket.on('connect',() => store.id = socket.id || '')
  nuxt.provide('io', socket)
})
