import type { Server } from 'socket.io'

export interface ModuleOptions {
  enabled: boolean;
  composables: boolean;
}

export interface SocketH3EventContext {
  server: Server,
  clients: Map<string, string[]>,
  emit: (event:string, message?:string) => void
}


declare module '#app' {
  interface NuxtApp {
    $socket: ReturnType<typeof import("socket.io-client")['io']>
  }
  interface NuxtOptions {
    socket: ModuleOptions
  }
}

declare module 'h3' {
	interface H3EventContext {
		io: SocketH3EventContext
	}
}
