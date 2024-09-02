import { io } from "socket.io-client"
import type { Socket } from "socket.io-client"
import { defineNuxtPlugin, useRuntimeConfig,useSocketIOStore } from '#imports'
import { configKey } from "../utils/constants"
import { nextTick } from "vue"

type SocketIOPlugin = { socket:Socket }

export default defineNuxtPlugin<SocketIOPlugin>({
  name:'nuxt-socket.io',
  parallel:true,
  async setup(nuxt) {
    const runtime = useRuntimeConfig()
    const options = { ...runtime.public?.[configKey] }
    await nuxt.hooks.callHook(`${configKey}:config`, options)

    const socket = io({
      ...options,
      autoConnect: false,
    })

    await nuxt.hooks.callHook(`${configKey}:done`, socket)
    nuxt.provide('io', socket)

    const store = useSocketIOStore()

    // Handle status with events
    socket.on('connect',() => {
      store.id = socket.id || ''
      store.transport = socket.io.engine.transport.name
      store.status.error = null
      store.status.connected = true
      store.status.pending = false
      store.status.active = true

      socket.io.engine.on('upgrade', (response) => {
        store.transport = response.name
      })
    })

    socket.on('connect_error', (error) => {
      store.status.error = error
      store.status.connected = false
      store.status.pending = socket.active
      store.transport = undefined
    })

    socket.io.on('reconnect_failed', () => {
      store.status.connected = store.status.pending = false
      store.transport = undefined
      store.status.active = false
    })

    socket.on('disconnect',() => {
      store.status.connected = store.status.pending = false
      store.transport = undefined
    })

    // Connect on client side only
    if (options.autoConnect) {
      store.status.pending = store.status.active = true
      if (import.meta.client) nextTick(() => socket.connect())
    }
  }
})
