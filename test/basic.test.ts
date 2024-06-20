import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, $fetch } from '@nuxt/test-utils'

describe('socket.io', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
    dev: true,
    nuxtConfig: {
      test:true
    }
  })

  it('response recieved', async () => {
    await $fetch('/',{
      onResponse({ response }) {
        return expect(response.ok).toBe(true)
      }
    })
  })
})
