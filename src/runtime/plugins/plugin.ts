import { io, type Socket } from "socket.io-client"
import { clientOptions } from '#socket.io:config'

type SocketIOPlugin = { socket:Socket }

export default defineNuxtPlugin<SocketIOPlugin>(async nuxt => {
	const { protocol, host } = window.location

  await nuxt.hooks.callHook('socket.io:config',clientOptions)
	const socket = io(`${ protocol }//${ host }`,clientOptions)

	await nuxt.hooks.callHook('socket.io:done',socket)
	nuxt.provide('socketIO', socket)
})
