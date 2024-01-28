import { Server } from 'socket.io'
import { getRequestURL } from 'h3'

import { useRuntimeConfig } from '#imports'
import type { Server as HTTPServer } from 'http'
import type { NitroApp } from 'nitropack'
type NitroAppPlugin = (nitro: NitroApp) => void

function defineNitroPlugin(def: NitroAppPlugin): NitroAppPlugin {
  return def
}

let wss:Server

export default defineNitroPlugin(nitro => {
	nitro.hooks.hookOnce('request', async event => {
		const runtime = useRuntimeConfig()

		// Start socket server
		const { socket } = event.node.res as any

		const server = socket?.server as HTTPServer
    const options = { ...runtime?.['socket.io'] }

    // Set default options
		const url = getRequestURL(event)

    options.transports = options.transports || ['websocket','polling']
		options.cors = options.cors || {
      credentials:true,
      origin: runtime?.domain || url.origin
    }

    // Create socket server
		wss = new Server(server,options)

		if (wss) console.info('Websocket server connected')

    // Remove client socket id on disconnect
    wss.on('connection', socket => {
      socket.on('disconnect',() => {
        wss.sockets?.adapter?.rooms.forEach(room => {
          if (room.has(socket.id)) room.delete(socket.id)
        })
      })
    })

		nitro.hooks.hook('close',() => wss.close())
    await nitro.hooks.callHook('socket.io:server:done',wss)


		// Increase event listener limit
		event.node.req.setMaxListeners(15)
		wss.setMaxListeners(15)

    await nitro.hooks.callHook('socket.io:server:done',wss)
	})

	nitro.hooks.hook('request', event => {
		event.context.io = event.context.io || {}
		event.context.io.server = wss
	})

})
