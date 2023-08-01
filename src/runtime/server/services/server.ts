import { Server, ServerOptions } from 'socket.io'
import { H3Event, getHeader } from 'h3'

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
  * @param { H3Event } event - `H3Event`
  * @param { string } id - Socket client id. You can pass custom id as string or an object with relative path to `event.context`. Default value is `event.context.session.user` | `event.context.user.id` } | `ip`.
  * @example
  * ```js
  * useServerSocketIo(event,{ path: 'user/id' })
  * ```
  * @returns {} { `server`, `clients` and `emit` }. Emit function send message for all clients with same `id`.
*/

export const useServerSocketIO = (event:H3Event, id:string) => {
  const { user, session } = event.context
  const { socket } = event.node.res as any

  // define client id
  const ip = getHeader(event, 'x-forwarded-for') || event.node.req.socket.remoteAddress
  const uid = parseId(event, id) || session?.user || user?.id || ip

  if (!uid) throw createError('No valid id provided')

  // start socketIO server
  if (!server) {
      const options = socket?.server as ServerOptions
      server = new Server(options)

      // close server on close nitro
      const nitro = useNitroApp()
      nitro.hooks.hook('close',() => { server.close() })

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

  // add socketIO to context
  event.context.socketIO = event.context.socketIO || {}
  event.context.socketIO.server = server
  event.context.socketIO.clients = clients

  // define custom emit function
  event.context.socketIO.emit = (event, message?) => {
      const sockets = clients.get(uid)
      sockets?.forEach(id => {
        server.sockets.sockets.get(id)?.emit(event, message)
      })
  }

  // return io
  return event.context.socketIO
}
