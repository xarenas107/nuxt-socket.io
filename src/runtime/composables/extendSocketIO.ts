import type { RuntimeNuxtHooks } from '#app'

const hook = 'socket.io:done'
type SocketIOHook = (options:RuntimeNuxtHooks[typeof hook]) => void

export const extendSocketIO:SocketIOHook = options => {
	const nuxt = useNuxtApp()
	nuxt.hook(hook, options)
}

