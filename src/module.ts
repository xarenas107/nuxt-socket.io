import {
  defineNuxtModule,
  useLogger,
  createResolver,
  hasNuxtModule,
  isNuxt3,
  getNuxtVersion,
} from "@nuxt/kit";
import { version } from "../package.json";
import defu from "defu";

export interface ModuleOptions {
  enabled: boolean
  composables: boolean
}

const configKey = "socketIO";
const logger = useLogger(`nuxt:${configKey}`);
const { resolve } = createResolver(import.meta.url);

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt/socketIO",
    configKey,
    compatibility: {
      nuxt: "^3.0.0",
    },
    version,
  },
  defaults: {
    enabled: true,
    composables: true,
  },
  setup(options, nuxt) {
    if (!options.enabled) return

    if (!isNuxt3(nuxt)) logger.error(`Cannot support nuxt version: ${getNuxtVersion(nuxt)}`)

    const runtimeDir = resolve(`./runtime`)
    const isPiniaModule = hasNuxtModule('@pinia/nuxt',nuxt)

    // transpile runtime
    nuxt.options.build.transpile.push(runtimeDir)

    nuxt.hook('app:templates',app => {
      // import templates
      app.templates.push({
        filename: `types/${ configKey }.d.ts`,
        src: resolve(runtimeDir,'types.d.ts')
      })
      // import plugins
      app.plugins.push({ src: resolve(runtimeDir, `plugins/${configKey}.client.ts`) })

      // pinia integration
      if (isPiniaModule) {
        app.templates.push({
          filename: `types/${ configKey }.pinia.d.ts`,
          src:resolve(runtimeDir,'types.pinia.d.ts')
        })
        app.plugins.push({ src: resolve(runtimeDir, 'plugins/pinia.ts') })
      }
    })

    // import composables
    nuxt.hook('imports:dirs', dirs => {
      if (!options.composables) return
      dirs.push(resolve(runtimeDir,'composables'))
    })

    // import server functions
    nuxt.hook('nitro:config', nitro => {
      if (!nitro.imports) return
      const name = 'useServerSocketIO'
      nitro.imports.imports = nitro.imports?.imports || []
      nitro.imports?.imports?.push({ name, from: resolve(runtimeDir,'server/services') })
    })

    // import types
    const { buildDir } = nuxt.options
    nuxt.hook('prepare:types', ({ references }) => {
      references.push({ path: resolve(buildDir, `types/${ configKey }.d.ts`) })

      if (isPiniaModule) {
        references.push({ path: resolve(buildDir, `types/${ configKey }.pinia.d.ts`) })
      }
    })

    logger.success('SocketIO connected')
  }
});
