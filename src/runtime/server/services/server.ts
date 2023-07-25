import { Server, ServerOptions } from 'socket.io'
import { useLogger } from '@nuxt/kit'
import { H3Event, getHeader } from 'h3'
import type { SocketH3EventContext } from '../../types'

const logger = useLogger('nuxt:socket.io')

const clients = new Map<string,string[]>()
let server:Server

type SocketId = string | { path:string }

//  parse client id
const parseId = (event: H3Event, id?:SocketId) => {
  let uid
  if (typeof id === 'object' && id?.path) {
    uid = event.context
    const keys = id?.path?.split('/') || id?.path?.split('.')
    for (const key of keys) uid = uid[key] ?? undefined
    return uid
  }
  return uid || undefined
}



/**
 * Get socket.io instance
 * @param { SocketId } id - Socket client id. Default value is `event.context.session.user` | `event.context.user.id` } | `ip`. You can pass custom id as string or an object with relative path to `event.context`
 * @example
 * ```js
 * useServerSocketIo(event,{ path: 'user/id' })
 * ```
 * @return { SocketH3EventContext } { `server`, `clients` and `emit` }. Emit function send message for all clients with same `id`.
 */

export const useServerSocketIo = (event: H3Event, id?:SocketId): SocketH3EventContext => {

  const { io, user, session } = event.context
  const { socket } = event.node.res as any

  // define client uid
  const ip = getHeader(event, 'x-forwarded-for') || event.node.req.socket.remoteAddress
  const uid = parseId(event, id) || session?.user || user?.id || ip

  if (!uid) throw new Error('No valid id provided')

  // start websocket server
  if (!server) {
      const options = socket?.server as ServerOptions
      server = new Server(options)

      // close server when close nitro
      const nitro = useNitroApp()
      nitro.hooks.hook('close',() => { server.close() })

      server.on('error',(error) => { logger.error(error) })

      server.on('connection', (socket) => {
          // store socket id on connection
          if (!clients.has(uid)) clients.set(uid,[])
          const sockets = clients.get(uid)

          const index = sockets?.findIndex(id => id === socket.id)
          if (index === -1) sockets?.push(socket.id)

          // delete socket id from store on disconnection
          socket.on('disconnect', () => {
              const index = sockets?.findIndex(id => id === socket.id) ?? -1
              if (index >= 0) sockets?.splice(index, 1)
          })
      })
  }

  // add io to context
  event.context.io = io || {}
  event.context.io.server = server
  event.context.io.clients = clients

  // define emit function for every client with same uid
  event.context.io.emit = (event:string, message?:string) => {
      const sockets = clients.get(uid)
      sockets?.forEach(id => {
        server.sockets.sockets.get(id)?.emit(event, message)
      })
  }

  // return io
  return event.context.io
}
