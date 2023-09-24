import { Server } from 'socket.io'
import type { H3Event, SocketH3EventContext } from 'h3'

declare module 'h3' {
  interface SocketH3EventContext {
    server: Server,
  }

}
type ContextSocketIO = (event: H3Event) => SocketH3EventContext
export const useServerSocketIO:ContextSocketIO = event => event.context.io
