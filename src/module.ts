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

import defu from "defu"
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
  defaults: {
    enabled: true,
    pinia: true,
    composables: true,
    header:true,
    client:{},
    server:{
      transports:["polling", "websocket"]
    }
  },
  async setup(options, nuxt) {
    if (!options.enabled) return;

    if (!isNuxt3(nuxt))
      logger.error(`Cannot support nuxt version: ${getNuxtVersion(nuxt)}`);


    // Config
    const config = nuxt.options.runtimeConfig
    config['socket.io'] = defu(config['socket.io'] || {},options.server)
    config.public['socket.io'] = defu(config.public?.['socket.io'] || {},options.client)

    // Transpile
    // nuxt.options.build.transpile.push(runtimeDir)
    // nuxt.options.build.transpile.push(configKey)
    nuxt.options.build.transpile.push(`${configKey}-client`)

    // Add plugins
    if (options.client !== false) addPlugin({ src: resolve(pluginsDir, "plugin") })

    if (options.pinia) options.pinia = hasNuxtModule("@pinia/nuxt", nuxt)
    if (options.pinia) addPlugin({ src: resolve(pluginsDir, "pinia") })
    if (options.header) addPlugin({ src: resolve(pluginsDir, "fetch") })

    // Import composables
    if (options.composables) addImportsDir(composablesDir)

    if (options.pinia) addImports({ from: resolve(runtimeDir,'utils/store.pinia'), name: 'useSocketIOStore' })
    else addImports({ from: resolve(runtimeDir,'utils/store'), name: 'useSocketIOStore' })

    // Add server plugin
    if (options.server !== false) addServerPlugin(resolve(serverDir, "plugins/plugin"));

    // Import server functions
    addServerImports([
      {
        name:'useSocketIO',
        from:resolve(serverDir, "services/useSocketIO"),
      },
      {
        name:'extendServerSocketIO',
        from:resolve(serverDir, "services/extendServerSocketIO"),
      }
    ])

    logger.success("Socket.io connected");
  },
})
