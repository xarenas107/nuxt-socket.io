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
- 👀 **Nuxt devTools**: ready to inspect with the [Nuxt DevTools](https://github.com/nuxt/devtools) inspector
- 🦾 **Type strong**: written in typescript

## 📦 Install

> Requires `socket.io` and  `socket.io-client`.

```bash
npm i socket.io socket.io-client @nuxt/socket.io -D 

# yarn 
yarn add socket.io socket.io-client @nuxt/socket.io -D

# pnpm 
pnpm add socket.io socket.io-client @nuxt/socket.io -D
```

## 🦄 Usage

> Add `@nuxt/socket.io` to the `modules` section of `nuxt.config.ts`.

```js
export default defineNuxtConfig({
  modules: [
    '@nuxt/socket.io'
  ]
})
```

> Use `useClientSocketIo()` on client side and the `useServerSocketIo()` on server side.

```js
// On client side
<script lang='ts' setup>
  const io = useClientSocketIo()
  io.on('pong',(message) => console.log(message))
  
  await $fetch('/api/ping')
</script>
```

```js
// On server side
export default defineEventHandler(event => {
  const io = useServerSocketIo(event)
  io.emit('pong','Response from server')
  return
})
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
[npm-version-src]: https://img.shields.io/npm/v/my-module/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@nuxt/socket.io

[npm-downloads-src]: https://img.shields.io/npm/dm/my-module.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@nuxt/socket.io

[license-src]: https://img.shields.io/npm/l/my-module.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/@nuxt/socket.io

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
