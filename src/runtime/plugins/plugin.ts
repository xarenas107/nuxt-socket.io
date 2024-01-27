import { io  } from "socket.io-client"
import type { Socket } from "socket.io-client"
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { useSocketIOStore } from '#imports'

type SocketIOPlugin = { socket:Socket }

export default defineNuxtPlugin<SocketIOPlugin>(async nuxt => {
  const runtime = useRuntimeConfig()
  const options = { ...runtime.public?.['socket.io']?.client }
	const socket = io(options)
	if (import.meta.client) window.onbeforeunload = () => { socket.close() }

	await nuxt.hooks.callHook('socket.io:done',socket)

  // Define store and save connection id
  nuxt.provide('io', socket)

  const store = useSocketIOStore()
  socket.on('connect',() => store.id = socket.id || '')
})
