import { Server } from 'socket.io'
import { Server as Engine } from "engine.io"
import { defineEventHandler, getCookie, getHeader } from 'h3'
import { serialize } from "cookie";
import { useRuntimeConfig } from 'nitropack/runtime'
import { configKey } from '../../utils/constants';

import type { NitroApp } from 'nitropack'
import type { ServerOptions } from 'socket.io'
type NitroAppPlugin = (nitro: NitroApp) => void

const defineNitroPlugin = (nitro: NitroAppPlugin) => nitro

export default defineNitroPlugin(async nitro => {
  const runtime = useRuntimeConfig()
  const options = { ...runtime.io } as Partial<ServerOptions>
  const { path = '/socket.io' } = options

  await nitro.hooks.callHook(`${configKey}:server:config`, options)
  const { cookie } = runtime.public[configKey]

  // Avoid cookie overlaping
  if (options.cookie) {
    const suffix = 'client'
    if (options.cookie === true) cookie.name = `${cookie.name}:${suffix}`
    else if (options.cookie.name === cookie.name) {
      cookie.name = `${cookie.name}:${suffix}`
    }
  }

  const engine = new Engine(options)
  const io = new Server(options)
  if (io) console.info('Websocket server initialized')

  io.bind(engine)

  await nitro.hooks.callHook(`${configKey}:server:done`, io)

  io.on('connection', (socket) => {
    engine.once('headers', headers => {
      headers['set-cookie'] = serialize(cookie.name, socket.id, cookie)
    })
  })

  nitro.router.use(path, defineEventHandler({
    handler(event) {
      const { req, res } = event.node
      engine.handleRequest(req, res)
      event._handled = true
    },
    websocket: {
      open(peer) {
        const context = peer.ctx.node
        const { req, ws } = context

        // @ts-expect-error private method
        engine.prepare(req)

        // @ts-expect-error private method
        engine.onWebSocket(req, req.socket, ws)
      },
    },
  }))

  // Set websocket context
  nitro.hooks.hook('request', event => {
    const id = cookie ? getCookie(event, cookie.name) : getHeader(event,'io')

    event.context.io = {
      server: io,
      to: (uid, ev, ...message) => {
        io?.sockets?.adapter?.rooms.get(uid)?.forEach(id => {
          return io.sockets.sockets.get(id)
            ?.emit(ev, ...message, event.method)
        })
        return true
      },
      self: (ev,...message) => {
        if (!id) return false
        io?.to(id).emit(ev, ...message, event.method)
        return true
      },
      getId: () => id,
    }
  })

  // Close websocket on nitro closes
  nitro.hooks.hook('close',() => io.close())
})

// export default defineNitroPlugin(nitro => {
//   const runtime = useRuntimeConfig()
//   nitro.hooks.hookOnce('request', async event => {

// 		// Start socket server
// 		const { socket } = event.node.res as any

// 		const server = socket?.server as HTTPServer
//     const options = { ...runtime['socket.io'] } as Partial<ServerOptions>

//     // Set default options
// 		const url = getRequestURL(event)
//     const domain = runtime?.domain as string

// 		options.cors = options.cors || {
//       credentials:true,
//       origin: domain || url.origin
//     }

//     // Create socket server
// 		wss = new Server(server,options)

// 		if (wss) console.info('Websocket server connected')

//     // Remove client socket id on disconnect
//     wss.on('connection', socket => {
//       socket.on('disconnect',() => {
//         wss.sockets?.adapter?.rooms.forEach(room => {
//           if (room.has(socket.id)) room.delete(socket.id)
//         })
//       })
//     })

// 		nitro.hooks.hook('close',() => wss.close())
//     await nitro.hooks.callHook('socket.io:server:done',wss)

// 		// Increase event listener limit
// 		event.node.req.setMaxListeners(15)
// 		wss.setMaxListeners(15)

//     await nitro.hooks.callHook('socket.io:server:done',wss)

//     defineSocketIOContext(event)
// 	})

// 	nitro.hooks.hook('request', event => { defineSocketIOContext(event) })

// })

// function defineSocketIOContext(event:H3Event, wss: Server) {
//   const socket = getHeader(event,'x-socket')

//   event.context.io = event.context.io || {} as SocketH3EventContext
//   event.context.io.server = wss

//   event.context.io.to = (uid, ev, ...message) => {
//     wss?.sockets?.adapter?.rooms.get(uid)?.forEach(id => {
//       return wss.sockets.sockets.get(id)
//         ?.compress(true).emit(ev, ...message,event.method)
//     })
//     return true
//   }

//   if (socket) {
//     event.context.io.self = (ev,...message) => {
//       if (!socket) return false
//       wss?.to(socket).compress(true).emit(ev, ...message,event.method)
//       return true
//     }
//     event.context.io.getId = () => socket
//   }
// }
