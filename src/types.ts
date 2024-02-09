
import type { Socket, SocketOptions, ManagerOptions } from 'socket.io-client'
import type { ServerOptions, Server } from 'socket.io'

export interface ModuleOptions {
  enabled: boolean
	pinia:boolean
  composables: boolean
  header?: boolean
  client?: Partial<SocketOptions & ManagerOptions> | false
  server?: Partial<ServerOptions> | false
}

export interface ModuleRuntimeHooks {
  'socket.io:done': (options:Socket) => Promise<void> | void
}

export interface ModulePublicRuntimeConfig {
  'socket.io': Partial<SocketOptions & ManagerOptions>
}

export interface ModuleRuntimeConfig {
  'socket.io': Partial<ServerOptions>
  domain: string
}


declare module '#app' {
  interface NuxtApp {
    $io: Socket
  }
}

export interface ModuleHooks {
  'socket.io:server:done': (options:Server) => Promise<void> | void
}

declare module 'h3' {
  type SocketH3EventContext = H3SocketContext
	interface H3EventContext {
		io: SocketH3EventContext
	}
}

declare module 'nitropack' {
	interface NitroRuntimeHooks {
    'socket.io:server:done': (options:Server) => Promise<void> | void
  }
}

export interface H3SocketContext {
  server: Server,
  self: Server['emit']
  to: (uid:string,ev:string,...message:any[]) => boolean
  getId: () => string | undefined
}
