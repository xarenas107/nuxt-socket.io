import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Http2ServerRequest, Http2ServerResponse } from 'node:http2'
import type { ServerOptions, Server } from 'socket.io'

type HookResult = Promise<void> | void

export interface ModuleHooks {
  'io:server:config': (options: Partial<ServerOptions>) => HookResult
  'io:server:done': (io: Server) => HookResult
}

declare module 'nitro/types' {
  interface NitroRuntimeHooks extends ModuleHooks {}
}

// engine.io handles HTTP/2 compat requests (socket.io documents `http2.createSecureServer`
// with `allowHTTP1`), but its types only declare HTTP/1. srvx serves HTTP/2 when TLS is set
declare module 'engine.io' {
  interface Server {
    handleRequest(req: IncomingMessage | Http2ServerRequest, res: ServerResponse | Http2ServerResponse): void
  }
}

export {}
