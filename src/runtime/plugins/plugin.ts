import { io  } from "socket.io-client"
import type { Socket } from "socket.io-client"
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { useSocketIOStore } from '#imports'
import { getRequestProtocol } from 'h3'
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
      const url = headers.get('host') || `${ headers.get('x-forwarded-for') }:${ headers.get('x-forwarded-port') }`

      if (nuxt.ssrContext?.event) {
        const protocol = getRequestProtocol(nuxt.ssrContext?.event)
        const origin = `${protocol}:${url}`
        host = origin.replace('http','ws')
      }
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
