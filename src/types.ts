import type { Socket, SocketOptions, ManagerOptions } from 'socket.io-client'
import type { ServerOptions } from 'socket.io'
import type { HookResult } from '@nuxt/schema'
import type { ModuleHooks } from './runtime/types/augments'

export type { ModuleHooks } from './runtime/types/augments'

type ClientOptions = SocketOptions & ManagerOptions & {
  cookie: ServerOptions['cookie']
}

export interface ModuleOptions {
  enabled: boolean
  pinia?: boolean
  composables?: boolean
  client?: Partial<ClientOptions> | false
  server?: Partial<ServerOptions> | false
}

export interface ModuleRuntimeHooks {
  'io:config': (options: Partial<ClientOptions>) => HookResult
  'io:done': (io: Socket, options?: Partial<ClientOptions>) => HookResult
}

export interface ModulePublicRuntimeConfig {
  io?: Partial<ClientOptions>
}

export interface ModuleRuntimeConfig {
  io?: Partial<ServerOptions>
}

declare module '#app' {
  interface RuntimeNuxtHooks extends ModuleRuntimeHooks {}
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    io?: Partial<ModuleOptions>
  }
  interface NuxtOptions {
    io: ModuleOptions
  }
  interface NuxtHooks extends ModuleHooks {}
  interface PublicRuntimeConfig extends ModulePublicRuntimeConfig {}
}
