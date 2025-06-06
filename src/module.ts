import {
  defineNuxtModule,
  useLogger,
  createResolver,
  hasNuxtModule,
  addPlugin,
  addImportsDir,
  addServerImports,
  addServerPlugin,
  addImports,
} from "@nuxt/kit"
import { configKey } from "./runtime/utils/constants"
import { defu } from 'defu'

import type { ModuleOptions } from "./types"
export * from "./types"

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: `@nuxt/socket.io`,
    configKey,
    compatibility: {
      nuxt: "^3.0.0",
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

    const logger = useLogger(`nuxt:${configKey}`);
    const { resolve } = createResolver(import.meta.url);
    const runtimeDir = resolve("./runtime");
    const pluginsDir = resolve(runtimeDir, "plugins");
    const composablesDir = resolve(runtimeDir, "composables");
    const serverDir = resolve(runtimeDir, "server");

    // Set config defaults
    if (options.client) {
      const { client } = options
      options.client = typeof client === "object" ? client : {}
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
      options.server = typeof server === "object" ? server : {}
    }

    const config = nuxt.options.runtimeConfig
    config[configKey] = defu(config[configKey] || {}, options.server)
    config.public[configKey] = defu(config.public?.[configKey] || {}, options.client)

    // Transpile
    nuxt.options.build.transpile.push(runtimeDir)
    nuxt.options.build.transpile.push(`socket.io-client`)

    // Enable nitro websocket
    nuxt.options.nitro.experimental ||= {}
    nuxt.options.nitro.experimental.websocket = true

    // Add plugins
    if (options.client) {
      addPlugin({ src: resolve(pluginsDir, "plugin") })
      addPlugin({ src: resolve(pluginsDir, "store") })

      if (!options.client.cookie) addPlugin({ src: resolve(pluginsDir, "fetch") })
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

    // Add server plugin
    if (options.server !== false) addServerPlugin(resolve(serverDir, "plugins/plugin"));

    // Import server functions
    addServerImports([
      {
        name:'useSocketIO',
        from:resolve(serverDir, "services/useSocketIO"),
      }
    ])

    logger.success('Socket.io initialized')
  },
})
