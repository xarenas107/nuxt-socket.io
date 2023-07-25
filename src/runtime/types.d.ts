import type { H3Event } from 'h3'
import type { Server } from 'socket.io'

export type ModuleOptions = {
  enabled: boolean
  composables: boolean
}

type SocketH3EventContext = {
  server: Server,
  clients: Map<string, string[]>,
  emit: (event:string, message?:unknown) => void
}

type SocketId = string | { path:string }
export type ServerSocketIo = (event: H3Event, id?:SocketId) => SocketH3EventContext

declare module '#app' {
  interface NuxtApp {
    $socket: ReturnType<typeof import("socket.io-client")['io']>
  }
  interface NuxtOptions {
    socket: ModuleOptions
  }
}

declare module 'h3' {
	interface H3EventContext {
		io: SocketH3EventContext
	}
}
