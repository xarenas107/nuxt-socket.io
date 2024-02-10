import type { NitroRuntimeHooks } from 'nitropack'

const hook = 'socket.io:server:done'
type ServerSocketIOHook = (options:NitroRuntimeHooks[typeof hook]) => void

export const extendServerSocketIO:ServerSocketIOHook = options => {
	const nitro = useNitroApp()
	nitro.hooks.hook(hook, options)
}

