import type { Server } from 'socket.io'
import type { ModuleOptions } from '../../types'

declare module 'h3' {
	interface SocketH3EventContext {
		server: Server,
	}
	interface H3EventContext {
		io: SocketH3EventContext
	}
}

export interface ModuleHooks {
  'socket.io:server:done': (options:Server) => Promise<void> | void
}

export interface ModuleRuntimeConfig {
  'socket.io': ModuleOptions['server']
}

declare module 'nitropack' {
	interface NitroRuntimeHooks {
    'socket.io:server:done': (options:Server) => Promise<void> | void
  }
}
