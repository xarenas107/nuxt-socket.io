import { io  } from "socket.io-client"
import type { Socket } from "socket.io-client"
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { useSocketIOStore } from '#imports'

type SocketIOPlugin = { socket:Socket }

export default defineNuxtPlugin<SocketIOPlugin>(async nuxt => {
  const runtime = useRuntimeConfig()

  const options = { ...runtime.public?.['socket.io'] }
  let host = options.host || ''

  if (!options?.host) {
    if (import.meta.client) {
      const { origin } = window.location
      const url = origin.replace('http','ws')
      host = url
    }
    else {
      const { headers } = nuxt.ssrContext?.event || { headers:new Map()  }
      const origin = `${ headers.get('x-forwarded-for') }:${ headers.get('x-forwarded-port') }`
      host = headers.get('host') || origin
    }
  }

	const socket = io(host,options)
	if (import.meta.client) window.onbeforeunload = () => { socket.close() }

	await nuxt.hooks.callHook('socket.io:done',socket)

  // Define store and save connection id
  nuxt.provide('io', socket)

  const store = useSocketIOStore()
  socket.on('connect',() => store.id = socket.id || '')
})
