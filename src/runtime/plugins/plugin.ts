import { io } from "socket.io-client"
import type { Socket } from "socket.io-client"
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { configKey } from "../utils/constants"

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

    nuxt.provide('io', socket)
    await nuxt.hooks.callHook(`${configKey}:done`, socket, options)
  }
})
