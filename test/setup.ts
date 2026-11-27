import { fileURLToPath } from 'node:url'
import { setup } from '@nuxt/test-utils/e2e'

await setup({
  rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  dev: true,
  nuxtConfig: {
    test: true,
    compatibilityDate: 'latest',
  },
})
