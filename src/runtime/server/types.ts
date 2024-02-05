import type { Server, ServerOptions } from 'socket.io'

declare module 'h3' {
	export interface SocketH3EventContext {
		server: Server,
    self: Server['emit']
    to: (uid:string,ev:string,...message:any[]) => boolean
    getId: () => string | undefined
	}
	interface H3EventContext {
		io: SocketH3EventContext
	}
}

export interface ModuleHooks {
  'socket.io:server:done': (options:Server) => Promise<void> | void
}

export interface ModuleRuntimeConfig {
  'socket.io': Partial<ServerOptions>
  domain: string
}

declare module 'nitropack' {
	interface NitroRuntimeHooks {
    'socket.io:server:done': (options:Server) => Promise<void> | void
  }
}
