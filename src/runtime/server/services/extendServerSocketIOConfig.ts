import type { NitroRuntimeHooks } from 'nitropack'

const hook = 'socket.io:server:config'
type ServerSocketIOConfigHook = (options:NitroRuntimeHooks[typeof hook]) => void

export const extendServerSocketIOConfig:ServerSocketIOConfigHook = options => {
	const nitro = useNitroApp()
	nitro.hooks.hook(hook, options)
}

