# Nuxt Socket.io

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

My new Nuxt module for doing amazing things.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
<!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/my-module?file=playground%2Fapp.vue) -->
<!-- - [📖 &nbsp;Documentation](https://example.com) -->
## 🚀 Features

- ⛰ **Nuxt 3 ready**
- 👌 **Zero config**: Configuration for common use cases
- ⚡ **Nitro ready**: Integration with nitro server.
- 🍍 **Pinia ready**: Integration with `@pinia/nuxt` module.
- ⚙️ **Auto import**: Provide auto import functions for client and server side.
- 🪝 **Customizable**: Provide hooks for customization on client and server side.
- 🦾 **Type strong**: Written in typescript
<!-- - 👀 **Nuxt devTools**: ready to inspect with the [Nuxt DevTools](https://github.com/nuxt/devtools) inspector -->

<!-- ## 📦 Install

> Requires `socket.io` and  `socket.io-client`.

```bash
npm i socket.io socket.io-client @nuxt/socket.io -D 

# yarn 
yarn add socket.io socket.io-client @nuxt/socket.io -D

# pnpm 
pnpm add socket.io socket.io-client @nuxt/socket.io -D
``` -->

## 🦄 Usage

> Add `@nuxt/socket.io` to the `modules` section of `nuxt.config.ts`.

```js
export default defineNuxtConfig({
  modules: [
    '@nuxt/socket.io'
  ]
})
```

> Extends socket.io configuration with `nuxt hooks`.

| Hook                     | Argument  | #Enviroment  | Description                                  |
|--------------------------|-----------|--------------|----------------------------------------------|
| socket.io:server:config  | options   | server       |  Called before configuring socket.io server  |
| socket.io:config         | options   | client       | Called before configuring socket.io-client   |
| socket.io:done           | socket    | client       | Called after socket.io-client initialization |

> Use `useSocketIO()` or `useSocketIOStore()` on client side and the `useServerSocketIO()` on server side.

```js
// On client side
<script lang='ts' setup>
  const io = useSocketIOStore() // Prevent duplicated listener
  io.on('pong',(message:string) => console.log(message))
  
  await $fetch('/api/ping')
</script>
```

```js
// On server side
export default defineEventHandler(event => {
  const io = useSocketIO(event)
  io.emit('pong','Response from server')
  return
})
```

> Or you can create your own methods

```js
// On server side plugin `server/plugins/wss.ts`
export default defineNitroPlugin(nitro => {

  // Add nitro hook
  nitro.hooks.hook('render:response', (response,{ event }) => {
    const { session, user, io } = event.context
    const uid = user?.id || session?.user?.toString()

    // Add connection listener
    if (!event.context.io?.server?.sockets?.adapter?.rooms?.has(uid)) {
      io.server.on('connection', socket => {
        if (!uid) return
        socket.on('disconnect',() => socket.leave(uid))
        socket.join(uid)
      })
    }
  })
})
```

```js
// On server side middleware `server/middleware/wss.ts`
import type { Server } from 'socket.io'

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
export default defineEventHandler(event => {
  const body = await readBody(event)
  
  // Update data on client
  const socket = useSocketIO(event)
  socket.emit('message', body)})
```

That's it! You can now use @nuxt/socket.io in your Nuxt app ✨

## Development

```bash
# Install dependencies
npm install

# Generate type stubs
npm run dev:prepare

# Develop with the playground
npm run dev

# Build the playground
npm run dev:build

# Run ESLint
npm run lint

# Run Vitest
npm run test
npm run test:watch

# Release new version
npm run release
```

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@nuxt-socket.io/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@nuxt-socket.io

[npm-downloads-src]: https://img.shields.io/npm/dm/@nuxt-socket.io.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@nuxt-socket.io

[license-src]: https://img.shields.io/npm/l/@nuxt-socket.io.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/@nuxt-socket.io

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
