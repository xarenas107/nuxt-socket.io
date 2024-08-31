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
export type { ModuleOptions, ModulePublicRuntimeConfig, ModuleRuntimeConfig, ModuleHooks, ModuleRuntimeHooks } from "./types"

const logger = useLogger(`nuxt:${configKey}`);

const { resolve } = createResolver(import.meta.url);
const runtimeDir = resolve("./runtime");
const pluginsDir = resolve(runtimeDir, "plugins");
const composablesDir = resolve(runtimeDir, "composables");
const serverDir = resolve(runtimeDir, "server");

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
  async setup(options, nuxt) {
    if (!options.enabled) return

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
      if (!options.client.cookie) addPlugin({ src: resolve(pluginsDir, "fetch") })
    }

    options.pinia ??= hasNuxtModule("@pinia/nuxt", nuxt)
    if (options.pinia) addPlugin({ src: resolve(pluginsDir, "pinia") })

    // Import composables
    if (options.composables) addImportsDir(composablesDir)

    const name = 'useSocketIOStore'
    if (options.pinia) addImports({ from: resolve(runtimeDir,'utils/store.pinia'), name })
    else addImports({ from: resolve(runtimeDir,'utils/store'), name })

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
