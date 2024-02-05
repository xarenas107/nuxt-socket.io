import type { Server, ServerOptions } from 'socket.io'

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
