import { io, type Socket } from "socket.io-client"
import { clientOptions } from '#socket.io:config'

type SocketIOPlugin = { socket:Socket }

export default defineNuxtPlugin<SocketIOPlugin>(async nuxt => {
  await nuxt.hooks.callHook('socket.io:config',clientOptions)

  const { origin } = window.location
	const url = origin.replace('http','ws')
	const socket = io(url,clientOptions)
	window.onbeforeunload = () => { socket.close() }


	await nuxt.hooks.callHook('socket.io:done',socket)
	nuxt.provide('io', socket)
})
