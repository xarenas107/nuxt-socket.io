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
  addImports
} from "@nuxt/kit"

import { version } from "../package.json"
import defu from "defu"
import type { ModuleOptions } from "./types"

export * from "./types"

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
    version,
  },
  defaults: {
    enabled: true,
    pinia: false,
    composables: true,
    header:true,
    client:{},
    server:{}
  },
  async setup(options, nuxt) {
    if (!options.enabled) return;

    if (!isNuxt3(nuxt))
      logger.error(`Cannot support nuxt version: ${getNuxtVersion(nuxt)}`);


    // Config
    const config = nuxt.options.runtimeConfig
    config['socket.io'] = defu(config['socket.io'] || {},{ server:options.server })
    config.public['socket.io'] = defu(config.public?.['socket.io'] || {}, { client:options.client })

    // Transpile
    nuxt.options.build.transpile.push(runtimeDir)

    // Add plugins
    if (options.client !== false) addPlugin({ src: resolve(pluginsDir, "plugin") })

    options.pinia = hasNuxtModule("@pinia/nuxt", nuxt);
    if (options.pinia) addPlugin({ src: resolve(pluginsDir, "pinia") })
    if (options.header) addPlugin({ src: resolve(pluginsDir, "fetch") })

    // Import composables
    if (options.composables) addImportsDir(composablesDir)

    if (options.pinia) addImports({ from: resolve(runtimeDir,'utils/store.pinia'), name: 'useSocketIOStore' })
    else addImports({ from: resolve(runtimeDir,'utils/store'), name: 'useSocketIOStore' })

    // Add server plugin
    if (options.server !== false) addServerPlugin(resolve(serverDir, "plugins/plugin"));

    // Import server functions
    // addServerImportsDir(resolve(serverDir, "services"))
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
