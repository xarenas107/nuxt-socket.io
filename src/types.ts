
import type { Socket, SocketOptions, ManagerOptions } from 'socket.io-client'

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
  }
	interface RuntimeNuxtHooks {
    'socket.io:config': (options:Options) => Promise<void> | void
    'socket.io:done': (options:Socket) => Promise<void> | void
  }
}

