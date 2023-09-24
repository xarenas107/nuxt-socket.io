import type { Socket, SocketOptions } from 'socket.io-client'

export type SocketClient = Socket

export interface ModuleOptions {
  enabled: boolean
	pinia:boolean
  composables: boolean
}

declare module '#app' {
  interface NuxtApp {
    $socketIO: SocketClient
  }
	interface RuntimeNuxtHooks {
    'socket.io:config': (options:SocketOptions) => Promise<void> | void
    'socket.io:done': (options:Socket) => Promise<void> | void
  }
}

