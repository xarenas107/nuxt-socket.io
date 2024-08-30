import { io } from "socket.io-client"
import type { Socket, SocketOptions, ManagerOptions } from "socket.io-client"
import { defineNuxtPlugin, useRuntimeConfig,useSocketIOStore } from '#imports'
import type { ClientOptions } from "~/src/types"

type SocketIOPlugin = { socket:Socket }

declare module '#app' {
  interface RuntimeNuxtHooks {
    'socket.io:config': (options: Partial<ClientOptions>) => Promise<void> | void
    'socket.io:done': (options:Socket) => Promise<void> | void
  }
}


export default defineNuxtPlugin<SocketIOPlugin>({
  name:'nuxt-socket.io',
  parallel:true,
  async setup(nuxt) {
    const runtime = useRuntimeConfig()
    const options = { ...runtime.public?.['socket.io'] } as Partial<SocketOptions & ManagerOptions>
    await nuxt.hooks.callHook('socket.io:config', options)

    const socket = io(options)
    await nuxt.hooks.callHook('socket.io:done', socket)

    if (import.meta.client) window.onbeforeunload = () => { socket.close() }
    nuxt.provide('io', socket)

    const store = useSocketIOStore()

    socket.on('connect',() => {
      store.id = socket.id || ''
      store.transport = socket.io.engine.transport.name
      store.status.connected = true

      socket.io.engine.on("upgrade", (response) => {
        store.transport = response.name
      })
    })
    socket.on('disconnect',() => {
      store.transport = 'N/A'
      store.status.connected = false
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
