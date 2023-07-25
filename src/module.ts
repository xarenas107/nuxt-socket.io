import {
  defineNuxtModule,
  useLogger,
  createResolver,
  addPlugin,
  addImportsDir,
  hasNuxtModule,
  addTemplate,
  isNuxt3,
  getNuxtVersion,
} from "@nuxt/kit";
import { version } from "../package.json";
import defu from "defu";

export interface ModuleOptions {
  enabled: boolean
  composables: boolean
}

const configKey = "socket.io";
const logger = useLogger(`nuxt:${configKey}`);
const { resolve } = createResolver(import.meta.url);

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "nuxt-socket.io",
    configKey,
    compatibility: {
      nuxt: "^3.0.0",
    },
    version,
  },
  // Default configuration options of the Nuxt module
  defaults: {
    enabled: true,
    composables: true,
  },
  setup(options, nuxt) {
    if (!isNuxt3(nuxt))
      logger.error(`Cannot support nuxt version: ${getNuxtVersion(nuxt)}`);

    options = defu(options, nuxt.options?.socket);

    if (!options?.enabled) return;
    const runtimeDir = resolve(`./runtime`);

    // import types
    addTemplate({
      filename: `types/${configKey}.d.ts`,
      src: resolve(runtimeDir, "types.d.ts"),
    });

    // pinia integration
    const isPiniaModule = hasNuxtModule("@pinia/nuxt", nuxt);
    nuxt.hook("modules:done", () => {

      if (!isPiniaModule) return;
      addTemplate({
        filename: `types/${configKey}.pinia.d.ts`,
        src: resolve(runtimeDir, "types.pinia.d.ts"),
      });

      addPlugin({ src: resolve(runtimeDir, "plugins/pinia") });
    });

    // import types
    const { buildDir } = nuxt.options;
    nuxt.hook("prepare:types", ({ references }) => {
      references.push({ types: configKey });
      references.push({ path: resolve(buildDir, `types/${configKey}.d.ts`) });

      if (isPiniaModule) {
        references.push({
          path: resolve(buildDir, `types/${configKey}.pinia.d.ts`),
        });
      }
    });

    // enable socket io server
    nuxt.hook("nitro:config", (nitro) => {
      if (nitro.imports) {
        const name = "useServerSocketIo";
        nitro.imports.imports = nitro.imports?.imports || [];
        nitro.imports?.imports?.push({
          name,
          from: resolve(runtimeDir, "server/services"),
        });
      }
    });

    // socket.io plugin
    addPlugin({ src: resolve(runtimeDir, "plugins/socket.client") });

    // import composables
    if (options.composables) addImportsDir(resolve(runtimeDir, "composables"));

    logger.success("Socket.io connected");
  },
});
