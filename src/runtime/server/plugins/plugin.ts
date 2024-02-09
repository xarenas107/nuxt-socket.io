import { Server } from 'socket.io'
import { getRequestURL, getHeader } from 'h3'

import { useRuntimeConfig } from '#imports'
import type { Server as HTTPServer } from 'http'
import type { NitroApp } from 'nitropack'
import type { ServerOptions } from 'socket.io'
type NitroAppPlugin = (nitro: NitroApp) => void

function defineNitroPlugin(def: NitroAppPlugin): NitroAppPlugin {
  return def
}

let wss:Server

export default defineNitroPlugin(nitro => {
  const runtime = useRuntimeConfig()
  nitro.hooks.hookOnce('request', async event => {

		// Start socket server
		const { socket } = event.node.res as any

		const server = socket?.server as HTTPServer
    const options = { ...runtime['socket.io'] } as Partial<ServerOptions>

    // Set default options
		const url = getRequestURL(event)
    const domain = runtime?.domain as string

    options.transports = options.transports || ['websocket','polling']
		options.cors = options.cors || {
      credentials:true,
      origin: domain || url.origin
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
    const socket = getHeader(event,'x-socket')

		event.context.io = event.context.io || {}
		event.context.io.server = wss

    event.context.io.self = (ev,...message) => {
      if (!socket) return false
      wss?.to(socket).compress(true).emit(ev, ...message,event.method)
      return true
    }

    event.context.io.to = (uid, ev, ...message) => {
      wss?.sockets?.adapter?.rooms.get(uid)?.forEach(id => {
        return wss.sockets.sockets.get(id)
          ?.compress(true).emit(ev, ...message,event.method)
      })
      return true
    }
    event.context.io.getId = () => socket
	})

})
