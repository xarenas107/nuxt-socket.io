
import type { Socket, SocketOptions, ManagerOptions } from 'socket.io-client'
import type { defineSocketIOStore } from './runtime/utils'

export type SocketClient = Socket
type Options = Partial<SocketOptions & ManagerOptions>

export interface ModuleOptions {
  enabled: boolean
	pinia:boolean
  composables: boolean
}

declare module '#app' {
  interface NuxtApp {
    $io: SocketClient
    '$io:store': ReturnType<typeof defineSocketIOStore>
  }
	interface RuntimeNuxtHooks {
    'socket.io:config': (options:Options) => Promise<void> | void
    'socket.io:done': (options:Socket) => Promise<void> | void
  }
}

