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

## ⚙️ Options

```js
export default defineNuxtConfig({
  io: {
    enabled: true, // Disable the whole module with `false`
    composables: true, // Auto import `useSocketIO()` on client side
    pinia: true, // Use a Pinia store for `useSocketIOStore()` (only when `@pinia/nuxt` is installed)
    // socket.io-client options, `false` disables the client plugins
    client: {
      path: '/websocket',
      autoConnect: true,
      // Cookie that identifies the client on server side, `false` sends an `io` header on `$fetch` instead
      cookie: { name: 'io', path: '/', sameSite: true, secure: true }, // `secure` is `false` in dev
    },
    // socket.io server options, `false` disables the server
    server: {
      path: '/websocket',
    },
  },
})
```

> `client.path` and `server.path` must match. If you change one, change both.

## 🪝 Hooks

> Client hooks are Nuxt app runtime hooks (`nuxtApp.hook(...)` in a Nuxt plugin). Server hooks are Nitro runtime hooks (`nitro.hooks.hook(...)` in a Nitro plugin).

| Hook             | Arguments         | Environment | Description                                  |
|------------------|-------------------|-------------|----------------------------------------------|
| io:server:config | server options    | server      | Called before configuring socket.io server   |
| io:server:done   | socket server     | server      | Called after socket.io server initialization |
| io:config        | client options    | client      | Called before configuring socket.io-client   |
| io:done          | socket, options   | client      | Called after socket.io-client initialization |

> The socket.io route is registered at build time from the `io.server.path` option, so changing `path` inside `io:server:config` has no effect.

## 🔌 Server context

`useSocketIO(event)` (same as `event.context.io`) returns:

| Property                    | Description                                                                 |
|-----------------------------|-----------------------------------------------------------------------------|
| `server`                    | The socket.io `Server` instance                                             |
| `getId()`                   | Socket id of the client that made the request, if any                       |
| `self(event, ...args)`      | Emit to the client that made the request. Returns `false` if it has no id   |
| `to(room, event, ...args)`  | Emit to a socket id or room                                                 |

> `self` and `to` append the request HTTP method as the last argument of the emitted event.

> The client is identified by the `io` cookie, or by the `io` header that `$fetch` sends when `client.cookie` is `false`.

> Use `useSocketIO()` or `useSocketIOStore()` on client side and `useSocketIO(event)` on server side, both auto-imported.

```vue
<!-- On client side -->
<script lang='ts' setup>
  const io = useSocketIOStore() // Prevent duplicated listener
  io.on('pong',(message:string) => console.log(message))
  
  await $fetch('/api/ping')
</script>
```

```js
// On server side `server/api/ping.ts`
import { defineEventHandler } from 'nuxt/server'

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

export default definePlugin(nitro => {
  // Register the connection listener once, when the socket.io server is ready
  nitro.hooks.hook('io:server:done', io => {
    io.on('connection', socket => {
      // e.g. sent by the client with `options.auth = { uid }` in the `io:config` hook
      const uid = socket.handshake.auth?.uid
      if (uid) socket.join(uid) // socket.io leaves rooms on disconnect
    })
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

export default defineEventHandler(async event => {
  const body = await readBody(event)
  
  // Send data to all clients
  const io = useSocketIO(event)
  io.server.emit('message', body)

  return null
})
```

## ⬆️ Migrating from v3 (Nitro v2)

- Install `nitro` (Nuxt 4.7+) or upgrade to Nuxt 5. `nitropack` (Nitro v2) is no longer supported.
- `defineNitroPlugin` → `definePlugin` from `nitro`; server utils (`defineEventHandler`, `getCookie`, `readBody`, ...) from `nuxt/server`.
- `useSocketIO(event)` is still auto-imported on server side.
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
