import { getEventContext } from 'nitro/h3'

import type { RequestEvent } from '@nuxt/schema'
import type { Server } from 'socket.io'

interface SocketH3EventContext {
  server: Server
  self: Server['emit']
  to: (uid: string, event: string, ...message: any[]) => boolean
  getId: () => string | undefined
}

declare module 'nitro/types' {
  interface ServerRequestContext {
    io: SocketH3EventContext
  }
}

export const useSocketIO = (event: RequestEvent) => {
  const context = getEventContext(event)
  return context.io
}
