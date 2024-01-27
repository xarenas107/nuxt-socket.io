import {
  defineNuxtModule,
  useLogger,
  createResolver,
  hasNuxtModule,
  isNuxt3,
  getNuxtVersion,
  addPlugin,
  addImportsDir,
  addServerHandler,
  addServerPlugin,
  addServerImportsDir,
} from "@nuxt/kit"

import { version } from "../package.json"
import type { ModuleOptions } from "./types"

export type * from "./types";
export type * from "./runtime/server/types";

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
  },
  async setup(options, nuxt) {
    if (!options.enabled) return;

    if (!isNuxt3(nuxt))
      logger.error(`Cannot support nuxt version: ${getNuxtVersion(nuxt)}`);

    // Transpile and alias runtime
    nuxt.options.alias['#socket.io:server:config'] = resolve(serverDir,'utils')
    nuxt.options.build.transpile.push(runtimeDir)

    // Add plugins
    addPlugin({ src: resolve(pluginsDir, "plugin.ts"), mode: "client" })

    options.pinia = hasNuxtModule("@pinia/nuxt", nuxt);
    if (options.pinia) addPlugin({ src: resolve(pluginsDir, "pinia") })

    // Import composables
    if (options.composables) addImportsDir(composablesDir)

    // Add server plugin
    addServerPlugin(resolve(serverDir, "plugins/plugin"));


    // Add server middleware
    addServerHandler({
      middleware: true,
      handler: resolve(serverDir, "middleware/context"),
      lazy: true,
    });

    // Import server functions
    addServerImportsDir(resolve(serverDir, "services"))

    logger.success("Socket.io connected");
  },
})
