import { io, type Socket } from "socket.io-client"
import { clientOptions, defineSocketIOStore } from "../../runtime/utils"

type SocketIOPlugin = { socket:Socket }

export default defineNuxtPlugin<SocketIOPlugin>(async nuxt => {
  await nuxt.hooks.callHook('socket.io:config',clientOptions)

  const { origin } = window.location
	const url = origin.replace('http','ws')
	const socket = io(url,clientOptions)
	window.onbeforeunload = () => { socket.close() }

	await nuxt.hooks.callHook('socket.io:done',socket)

  // Define store and save connection id
  const store = defineSocketIOStore(socket)
  socket.on('connect',() => store.id = socket.id || '')

  nuxt.provide('io', socket)
  nuxt.provide('io:store', store)
})
