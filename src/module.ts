import {
  defineNuxtModule,
  useLogger,
  createResolver,
  hasNuxtModule,
  isNuxt3,
  getNuxtVersion,
  addPlugin,
  addImportsDir,
  addServerImports,
  addServerPlugin,
  addImports,
} from "@nuxt/kit"
import { defu } from 'defu'

import type { ModuleOptions } from "./types"
export type * from "./types"

const configKey = "socket.io";
const logger = useLogger(`nuxt:${configKey}`);

const { resolve } = createResolver(import.meta.url);
const runtimeDir = resolve("./runtime");
const pluginsDir = resolve(runtimeDir, "plugins");
const composablesDir = resolve(runtimeDir, "composables");
const serverDir = resolve(runtimeDir, "server");

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: `@nuxt/${configKey}`,
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

    if (!isNuxt3(nuxt))
      logger.error(`Cannot support nuxt version: ${getNuxtVersion(nuxt)}`)

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

    const key = 'socket.io'
    const config = nuxt.options.runtimeConfig
    config[key] = defu(config[key] || {}, options.server)
    config.public[key] = defu(config.public?.[key] || {}, options.client)

    // Transpile
    nuxt.options.build.transpile.push(`${configKey}-client`)

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
  },
})
