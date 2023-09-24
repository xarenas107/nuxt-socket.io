import { Server } from 'socket.io'
import type { Server as HTTPServer } from 'http'
import { useLogger } from "@nuxt/kit"
import { serverOptions } from '#socket.io:server:config'

let wss:Server

const logger = useLogger('nuxt:socketIO')

export default defineNitroPlugin(nitro => {
	nitro.hooks.hookOnce('request',async event => {

		// Start socket server
		if (!wss) {
			const { socket } = event.node.res as any
			const server = socket?.server as HTTPServer

      await nitro.hooks.callHook('socket.io:server:config',serverOptions)
			wss = new Server(server,serverOptions)
			if (wss) logger.success('Websocket server connected')
			nitro.hooks.hook('close',() => wss.close())
		}
	})
	nitro.hooks.hook('request', event => {
		event.context.io = event.context.io || {}
		event.context.io.server = wss
	})
})
