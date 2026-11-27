# Nuxt Socket.io

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

A Nuxt module for `socket.io`

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
<!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/my-module?file=playground%2Fapp.vue) -->
<!-- - [📖 &nbsp;Documentation](https://example.com) -->
## 🚀 Features

- ⛰ **Nuxt 4.7+ / Nuxt 5 ready**
- 👌 **Zero config**: Configuration for common use cases
- ⚡ **Nitro v3 ready**: Integration with the Nitro v3 server (websocket + long-polling).
- 🍍 **Pinia ready**: Integration with `@pinia/nuxt` module.
- ⚙️ **Auto import**: Provide auto import functions for client and server side.
- 🪝 **Customizable**: Provide hooks for customization on client and server side.
- 🦾 **Type strong**: Written in typescript
<!-- - 👀 **Nuxt devTools**: ready to inspect with the [Nuxt DevTools](https://github.com/nuxt/devtools) inspector -->

## ✅ Requirements

- Nuxt `>= 4.7` with **Nitro v3** (or Nuxt 5, where Nitro v3 is the default)
- A Node.js server runtime (the module uses the Node.js request/socket under the hood)

On Nuxt 4.7+, Nitro v3 is enabled by declaring the `nitro` package in your project:

```bash
npm i nitro
```

## 📦 Install

```bash
npm i @xarenas107/nuxt-socket-io -D 
```

## 🦄 Usage

> Add `@xarenas107/nuxt-socket-io` to the `modules` section of `nuxt.config.ts`.

```js
export default defineNuxtConfig({
  modules: [
    '@xarenas107/nuxt-socket-io'
  ]
})
```

> Extends socket.io configuration with `nuxt hooks`.

| Hook             | Argument         | #Enviroment | Description                                  |
|------------------|------------------|-------------|----------------------------------------------|
| io:server:config | server options   | server      | Called before configuring socket.io server   |
| io:server:done   | socket server    | server      | Called after socket.io server initialization |
| io:config        | client options   | client      | Called before configuring socket.io-client   |
| io:done          | socket           | client      | Called after socket.io-client initialization |

> Server hooks are registered from a Nitro plugin with `nitro.hooks.hook('io:server:config' | 'io:server:done', ...)`. The socket.io route is registered at build time from the `io.server.path` option, so changing `path` inside `io:server:config` has no effect.

> Use `useSocketIO()` or `useSocketIOStore()` on client side and `useSocketIO(event)` on server side, auto-imported, or imported from `#socket-io/server` when server auto-imports are disabled (Nuxt 5 default).

```js
// On client side
<script lang='ts' setup>
  const io = useSocketIOStore() // Prevent duplicated listener
  io.on('pong',(message:string) => console.log(message))
  
  await $fetch('/api/ping')
</script>
```

```js
// On server side `server/api/ping.ts`
import { defineEventHandler } from 'nuxt/server'
import { useSocketIO } from '#socket-io/server'

export default defineEventHandler(event => {
  // You can access to io server through `event.context.io` or `useSocketIO(event).server`
  const io = useSocketIO(event)
  
  const id = io.getId()
  if (id) io.to(id,'pong','Response from server')
  return
})
```

> Or you can create your own methods

```js
// On server side plugin `server/plugins/wss.ts`
import { definePlugin } from 'nitro'
import { getEventContext } from 'nitro/h3'

export default definePlugin(nitro => {

  // Add nitro hook
  nitro.hooks.hook('request', event => {
    const { session, user, io } = getEventContext(event)
    const uid = user?.id || session?.user?.toString()

    // Add connection listener
    if (!event.context.io?.server?.sockets?.adapter?.rooms?.has(uid)) {
      io.server.on('connection', socket => {
        if (!uid) return
        socket.join(uid)
        socket.on('disconnect',() => socket.leave(uid))
      })
    }
  })
})
```

```js
// On server side middleware `server/middleware/wss.ts`
import type { Server } from 'socket.io'
import { defineEventHandler } from 'nuxt/server'

export default defineEventHandler(event => {
  const { session, user, io } = event.context
  const uid = user?.id || session?.user?.toString()

  event.context.io.emit = (event, message) => {
    return io.server.to(uid).compress(true).emit(event, message)
  }
})

declare module 'h3' {
  interface SocketH3EventContext {
    emit: Server['emit']
  }
}
```

```js
// On server handler `server/api/chat.post.ts`
import { defineEventHandler, readBody } from 'nuxt/server'
import { useSocketIO } from '#socket-io/server'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  
  // Send data to client
  const io = useSocketIO(event)
  io.emit('message', body)

  return null
})
```

## ⬆️ Migrating from v3 (Nitro v2)

- Install `nitro` (Nuxt 4.7+) or upgrade to Nuxt 5. `nitropack` (Nitro v2) is no longer supported.
- `defineNitroPlugin` → `definePlugin` from `nitro`; server utils (`defineEventHandler`, `getCookie`, `readBody`, ...) from `nuxt/server`.
- `useSocketIO(event)` is still auto-imported; with auto-imports disabled import it from `#socket-io/server`.
- `nitro.experimental.websocket` is set for you as `nitro.features.websocket`.
- `pinia` integration is now only enabled when `@pinia/nuxt` is installed.

That's it! You can now use `@xarenas107/nuxt-socket-io` in your Nuxt app ✨

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@xarenas107/nuxt-socket-io/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@xarenas107/nuxt-socket-io

[npm-downloads-src]: https://img.shields.io/npm/dm/@xarenas107/nuxt-socket-io.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@xarenas107/nuxt-socket-io

[license-src]: https://img.shields.io/npm/l/@xarenas107/nuxt-socket-io.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/@xarenas107/nuxt-socket-io

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
