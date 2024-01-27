import { useNuxtApp } from '#app'
import type { RuntimeNuxtHooks } from '#app'

const hook = 'socket.io:config'
type SocketIOConfigHook = (options:RuntimeNuxtHooks[typeof hook]) => void

export const extendSocketIOConfig:SocketIOConfigHook = options => {
	const nuxt = useNuxtApp()
	nuxt.hook(hook, options)
}

