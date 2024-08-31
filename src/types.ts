
import type { Socket, SocketOptions, ManagerOptions } from 'socket.io-client'
import type { ServerOptions, Server } from 'socket.io'
import type { HookResult } from '@nuxt/schema'
type ClientOptions = SocketOptions & ManagerOptions & {
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

export interface ModuleRuntimeHooks {
  'io:config': (options: Partial<ClientOptions>) => HookResult
  'io:done': (options:Socket) => HookResult
}

export interface ModuleHooks {
  'io:server:config': (options: Partial<ServerOptions>) => HookResult
  'io:server:done': (options: Server) => HookResult
}

export interface ModulePublicRuntimeConfig {
  io?: Partial<ClientOptions>
}

export interface ModuleRuntimeConfig {
  io?: Partial<ServerOptions>
}

declare module '#app' {
  interface RuntimeNuxtHooks {
    'io:config': (options: Partial<ClientOptions>) => HookResult
    'io:done': (options:Socket) => HookResult
  }
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    io?: Partial<ModuleOptions>
  }
  interface NuxtOptions {
    io?: ModuleOptions
  }
}

declare module 'nitropack' {
	interface NitroRuntimeHooks {
    'io:server:config': (options: Partial<ServerOptions>) => HookResult
    'io:server:done': (options: Server) => HookResult
  }
}
