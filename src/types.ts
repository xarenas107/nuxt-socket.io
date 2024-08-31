
import type { Socket, SocketOptions, ManagerOptions } from 'socket.io-client'
import type { ServerOptions, Server } from 'socket.io'

export type ClientOptions = SocketOptions & ManagerOptions & {
  cookie: ServerOptions['cookie']
}

export interface ModuleOptions {
  enabled: boolean
	pinia?:boolean
  composables?: boolean
  header?: boolean
  client?: Partial<ClientOptions> | false
  server?: Partial<ServerOptions> | false
}

declare module 'nitropack' {
	export interface NitroRuntimeHooks {
    'io:server:config': (options: Partial<ServerOptions>) => Promise<void> | void
    'io:server:done': (options: Server) => Promise<void> | void
  }
}

export interface ModuleRuntimeHooks {
  'io:config': (options: Partial<ClientOptions>) => Promise<void> | void
  'io:done': (options:Socket) => Promise<void> | void
}

export interface ModuleHooks {
  'io:server:config': (options: Partial<ServerOptions>) => Promise<void> | void
  'io:server:done': (options: Server) => Promise<void> | void
}

export interface ModulePublicRuntimeConfig {
  io?: Partial<ClientOptions>
}

export interface ModuleRuntimeConfig {
  io?: Partial<ServerOptions>
}
