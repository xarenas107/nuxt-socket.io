import { Server } from 'socket.io'
import { Server as Engine } from "engine.io"
import { defineEventHandler, getCookie, getHeader } from 'h3'
import { serialize } from 'cookie'
import { useRuntimeConfig } from 'nitropack/runtime'
import { configKey } from '../../utils/constants'

import type { ServerOptions } from 'socket.io'
import type { NitroApp } from 'nitropack/types'
type NitroAppPlugin = (nitro: NitroApp) => void

const defineNitroPlugin = (nitro: NitroAppPlugin) => nitro

export default defineNitroPlugin(async nitro => {
  const runtime = useRuntimeConfig()
  const options = { ...runtime.io } as Partial<ServerOptions>
  await nitro.hooks.callHook(`${configKey}:server:config`, options)

  const { path = '/socket.io' } = options
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

  if (cookie) {
    io.on('connection', (socket) => {
      engine.once('headers', headers => {
        headers['set-cookie'] = serialize(cookie.name, socket.id, cookie)
      })
    })
  }

  nitro.router.use(path, defineEventHandler({
    handler(event) {
      const { req, res } = event.node
      engine.handleRequest(req as any, res)
      event._handled = true
    },
    websocket: {
      open(peer) {
        // @ts-expect-error private method and property
        const { nodeReq } = peer._internal
        // @ts-expect-error private method and property
        engine.prepare(nodeReq);
        // @ts-expect-error private method and property
        engine.onWebSocket(nodeReq, nodeReq.socket, peer.websocket)
      },
    },
  }))

  // Set websocket context
  nitro.hooks.hook('request', event => {
    const id = cookie ? getCookie(event, cookie.name) : getHeader(event,'io')

    event.context.io = {
      server: io,
      to: (uid, ev, ...message) => {
        io?.to(uid)?.emit(ev, ...message, event.method)
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
