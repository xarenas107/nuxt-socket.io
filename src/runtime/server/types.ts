import type { Server } from 'socket.io'

export type SocketServer = Server
export type { ServerOptions } from 'socket.io'

declare module 'h3' {
	interface SocketH3EventContext {
		server: Server,
	}
	interface H3EventContext {
		io: SocketH3EventContext
	}
}

declare module 'nitropack' {
	interface NitroRuntimeHooks {
    'socket.io:server:done': (options:Server) => Promise<void> | void
  }
}

