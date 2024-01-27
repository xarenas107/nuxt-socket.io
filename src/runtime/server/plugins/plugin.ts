import { Server } from 'socket.io'
import type { Server as HTTPServer } from 'http'

let wss:Server

export default defineNitroPlugin(nitro => {

	nitro.hooks.hookOnce('request', event => {
		const runtime = useRuntimeConfig()

		// Start socket server
		const { socket } = event.node.res as any

		const ip = getRequestIP(event,{ xForwardedFor:true })
		const url = getRequestURL(event)

		const server = socket?.server as HTTPServer
		wss = new Server(server,{
			transports:['websocket','polling'],
			cors: {
				credentials:true,
				origin: [runtime?.domain,`${ip}:${url.port}`,url.host],
			}
		})

		if (wss) console.info('Websocket server connected')
		nitro.hooks.hook('close',() => wss.close())

		// Increase event listener limit
		event.node.req.setMaxListeners(15)
		wss.setMaxListeners(15)
	})

	nitro.hooks.hook('request', event => {
		event.context.io = event.context.io || {}
		event.context.io.server = wss
	})
})
