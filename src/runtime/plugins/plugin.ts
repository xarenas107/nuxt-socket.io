import { io  } from "socket.io-client"
import type { Socket, SocketOptions, ManagerOptions } from "socket.io-client"
import { defineNuxtPlugin, useRuntimeConfig,useSocketIOStore, createError } from '#imports'
import { getRequestURL } from 'h3'
type SocketIOPlugin = { socket:Socket }

export default defineNuxtPlugin<SocketIOPlugin>({
  name:'nuxt-socket.io',
  parallel:true,
  async setup(nuxt) {
    const runtime = useRuntimeConfig()

    const options = { ...runtime.public?.['socket.io'] } as Partial<SocketOptions & ManagerOptions>
    let host = options.host || ''

    if (!options?.host) {
      if (import.meta.client) {
        const { origin } = window.location
        const url = origin.replace('http','ws')
        host = url
      }
      else {
        const event = nuxt.ssrContext?.event
        const { origin } = event ? getRequestURL(event) : { origin:null }
        if (!origin) throw createError('No origin found')
        host = origin.replace('http','ws')
      }
    }

    const socket = io(host,options)
    if (import.meta.client) window.onbeforeunload = () => { socket.close() }

    await nuxt.hooks.callHook('socket.io:done',socket)

    // Define store and save connection id
    nuxt.provide('io', socket)

    const store = useSocketIOStore()
    socket.on('connect',() => {
      store.id = socket.id || ''
    })
  }
})

declare module '#app' {
  interface NuxtApp {
    $io: Socket
  }
  interface RuntimeNuxtHooks {
    'socket.io:done': (options:Socket) => Promise<void> | void
  }
}
