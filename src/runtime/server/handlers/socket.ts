import { once } from 'node:events'
import { defineWebSocketHandler, fromNodeHandler } from 'nitro/h3'
import { fromNodeUpgradeHandler } from 'crossws/adapters/node'
import { createError } from 'nuxt/server'
import { useSocketIOInstance } from '../plugins/plugin'

const useEngine = () => {
  const instance = useSocketIOInstance()
  if (!instance) throw createError({ status: 503, message: 'Socket.io server is not initialized' })
  return instance.engine
}

// Long-polling transport: engine.io answers held requests later, so h3 must wait for the
// response to close (not rely on the handler arity, which bundlers may change)
const polling = fromNodeHandler((req, res) => {
  const engine = useEngine()
  engine.handleRequest(req, res)
  return once(res, 'close')
})

const websocket = fromNodeUpgradeHandler((req, socket, head) => {
  const engine = useEngine()
  engine.handleUpgrade(req, socket, head)
})

export default defineWebSocketHandler(websocket, polling)
