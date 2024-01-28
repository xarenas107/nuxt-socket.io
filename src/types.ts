
import type { Socket, SocketOptions, ManagerOptions } from 'socket.io-client'
import type { ServerOptions } from 'socket.io'

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

declare module '#app' {
  interface NuxtApp {
    $io: Socket
  }
}
