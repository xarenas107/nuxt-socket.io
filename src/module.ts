import {
  defineNuxtModule,
  useLogger,
  createResolver,
  hasNuxtModule,
  addPlugin,
  addImportsDir,
  addServerImports,
  addNitroPlugin,
  addImports,
  addServerHandler,
  addTypeTemplate,
} from '@nuxt/kit'
import { configKey } from './runtime/utils/constants'
import { defu } from 'defu'

import type { ModuleOptions } from './types'

export * from './types'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: `@nuxt/socket.io`,
    configKey,
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  defaults: nuxt => ({
    enabled: true,
    composables: true,
    client: {
      path: '/websocket',
      autoConnect: true,
      cookie: {
        name: 'io',
        path: '/',
        sameSite: true,
        secure: !nuxt.options.dev,
      },
    },
    server: {
      path: '/websocket',
    },
  }),
  setup(options, nuxt) {
    if (!options.enabled) return

    const logger = useLogger(`nuxt:${configKey}`)
    const { resolve } = createResolver(import.meta.url)
    const runtimeDir = resolve('./runtime')
    const pluginsDir = resolve(runtimeDir, 'plugins')
    const composablesDir = resolve(runtimeDir, 'composables')
    const serverDir = resolve(runtimeDir, 'server')

    // Set config defaults
    if (options.client) {
      const { client } = options
      options.client = typeof client === 'object' ? client : {}

      if (client.cookie === true) {
        options.client.cookie = {
          name: 'io',
          path: '/',
          sameSite: true,
          secure: !nuxt.options.dev,
        }
      }
    }

    if (options.server) {
      const { server } = options
      options.server = typeof server === 'object' ? server : {}
    }

    const config = nuxt.options.runtimeConfig
    config[configKey] = defu(config[configKey] || {}, options.server)
    config.public[configKey] = defu(config.public?.[configKey] || {}, options.client)

    // Transpile
    // socket.io-client ships ESM: transpiling it excludes it from Vite pre-bundling and breaks its CJS `debug` dep
    nuxt.options.build.transpile.push(runtimeDir)

    // Enable nitro websocket
    nuxt.options.nitro.features ||= {}
    nuxt.options.nitro.features.websocket = true

    // Add plugins
    if (options.client) {
      addPlugin({ src: resolve(pluginsDir, 'plugin') })
      addPlugin({ src: resolve(pluginsDir, 'store') })

      if (!options.client.cookie) addPlugin({ src: resolve(pluginsDir, 'fetch') })
    }

    // Import composables
    if (options.composables) addImportsDir(composablesDir)

    options.pinia = options.pinia !== false || hasNuxtModule('@pinia/nuxt')
    const path = options.pinia ? 'utils/store.pinia' : 'utils/store'

    addImports({
      from: resolve(runtimeDir, path),
      as: 'useSocketIOStore',
      name: 'store',
    })

    // Add server plugin and socket.io endpoint
    if (options.server !== false) {
      addNitroPlugin(resolve(serverDir, 'plugins/plugin'))

      const path = (options.server?.path || '/socket.io').replace(/\/+$/, '')
      const handler = resolve(serverDir, 'handlers/socket')
      addServerHandler({ route: path, handler })
      addServerHandler({ route: `${path}/**`, handler })
    }

    // Nitro hook types: `src/types.ts` is not part of the server type context
    addTypeTemplate({
      filename: 'types/nuxt-socket-io.d.ts',
      getContents: () => `import '${resolve(runtimeDir, 'types/augments')}'\nexport {}\n`,
    }, { nitro: true, nuxt: true, node: true })

    // Import server functions
    addServerImports([
      {
        name: 'useSocketIO',
        from: resolve(serverDir, 'services/useSocketIO'),
      },
    ])

    logger.success('Socket.io initialized')
  },
})
