
import type { Socket, SocketOptions, ManagerOptions } from 'socket.io-client'
import type { ServerOptions } from 'socket.io'

export type SocketClient = Socket

export interface ModuleOptions {
  enabled: boolean
	pinia:boolean
  composables: boolean
  client?: Partial<SocketOptions & ManagerOptions>
  server?: Partial<ServerOptions>
}

declare module '#app' {
  interface NuxtApp {
    $io: SocketClient
  }
  interface ModuleRuntimeHooks {
    'socket.io:done': (options:Socket) => Promise<void> | void
  }

}

export interface ModuleRuntimeHooks {
  'socket.io:done': (options:Socket) => Promise<void> | void
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    ['socket.io']?: Partial<ModuleOptions>
  }
  interface NuxtOptions {
    ['socket.io']?: ModuleOptions
  }
}
