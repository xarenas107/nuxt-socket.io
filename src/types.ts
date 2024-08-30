
import type { Socket, SocketOptions, ManagerOptions } from 'socket.io-client'
import type { ServerOptions, Server } from 'socket.io'

export type ClientOptions = SocketOptions & ManagerOptions & {
  cookie: ServerOptions['cookie']
}

export interface ModuleOptions {
  enabled: boolean
	pinia:boolean
  composables: boolean
  header?: boolean
  client?: Partial<ClientOptions> | false
  server?: Partial<ServerOptions> | false
}

export interface ModuleRuntimeHooks {
  'socket.io:config': (options: Partial<ClientOptions>) => Promise<void> | void
  'socket.io:done': (options:Socket) => Promise<void> | void
}

export interface ModulePublicRuntimeConfig {
  'socket.io': Partial<ClientOptions>
}

export interface ModuleRuntimeConfig {
  'socket.io': Partial<ServerOptions>
  domain: string
}

export interface ModuleHooks {
  'socket.io:server:config': (options: Partial<ServerOptions>) => Promise<void> | void
  'socket.io:server:done': (options: Server) => Promise<void> | void
}
