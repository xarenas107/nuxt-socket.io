import type { H3Event, SocketH3EventContext } from 'h3'
import type { Server } from 'socket.io'

export interface H3ESocket {
  server: Server,
  self: Server['emit']
  to: (uid:string,ev:string,...message:any[]) => boolean
  getId: () => string | undefined
}

export function useSocketIO(event:H3Event): H3ESocket & SocketH3EventContext
export function useSocketIO(event:H3Event) { return event.context.io }
