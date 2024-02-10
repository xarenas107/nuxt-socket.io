import type { H3Event   } from 'h3'
import type { Server } from 'socket.io'

declare module 'h3' {
  interface SocketH3EventContext {
    server: Server,
    self: Server['emit']
    to: (uid:string,ev:string,...message:any[]) => boolean
    getId: () => string | undefined
  }
	interface H3EventContext {
		io: SocketH3EventContext
	}
}
export const useSocketIO = (event:H3Event) => event.context.io
