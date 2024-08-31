import { io } from "socket.io-client"
import type { Socket, SocketOptions, ManagerOptions } from "socket.io-client"
import { defineNuxtPlugin, useRuntimeConfig,useSocketIOStore } from '#imports'
import { configKey } from "../utils/constants"

type SocketIOPlugin = { socket:Socket }

export default defineNuxtPlugin<SocketIOPlugin>({
  name:'nuxt-socket.io',
  parallel:true,
  async setup(nuxt) {
    const runtime = useRuntimeConfig()
    const options = { ...runtime.public?.[configKey] } as Partial<SocketOptions & ManagerOptions>
    await nuxt.hooks.callHook(`${configKey}:config`, options)

    const socket = io(options)
    await nuxt.hooks.callHook(`${configKey}:done`, socket)

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
