import { Server } from 'socket.io'
import { Server as Engine } from 'engine.io'
import { stringifySetCookie } from 'cookie'
import { configKey } from '../../utils/constants'
import { definePlugin } from 'nitro'
import { getCookie, getEventContext } from 'nitro/h3'
import { useRuntimeConfig } from 'nuxt/server'

import type { ServerOptions } from 'socket.io'
import type { SetCookie } from 'cookie'
import type { H3EventContext } from 'nitro/h3'

type CookieOptions = Omit<SetCookie, 'name' | 'value'>

function serialize(name: string, value: string, options: CookieOptions) {
  return stringifySetCookie({ ...options, name, value })
}

export interface SocketIOInstance {
  io: Server
  engine: Engine
}

let instance: SocketIOInstance | undefined

// Shared with the route handler: Nitro v3 plugins cannot register routes at runtime
export const useSocketIOInstance = () => instance

export default definePlugin(async (nitro) => {
  const runtime = useRuntimeConfig()
  const options: Partial<ServerOptions> = { ...runtime.io }
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
  instance = { io, engine }

  await nitro.hooks.callHook(`${configKey}:server:done`, io)

  if (cookie) {
    io.on('connection', (socket) => {
      engine.once('headers', (headers) => {
        headers['set-cookie'] = serialize(cookie.name, socket.id, cookie)
      })
    })
  }

  // Set websocket context
  nitro.hooks.hook('request', (event) => {
    const id = cookie ? getCookie(event, cookie.name) : event.req.headers.get('io') ?? undefined
    const { method } = event.req

    const context = getEventContext<H3EventContext>(event)
    context.io = {
      server: io,
      to: (uid: string, ev: string, ...message: any[]) => {
        io?.to(uid)?.emit(ev, ...message, method)
        return true
      },
      self: (ev: string, ...message: any[]) => {
        if (!id) return false
        io?.to(id).emit(ev, ...message, method)
        return true
      },
      getId: () => id,
    }
  })

  // Close websocket on nitro closes
  nitro.hooks.hook('close', () => {
    io.close()
    instance = undefined
  })
})
