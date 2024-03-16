import { describe, it, expect, } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, $fetch } from '@nuxt/test-utils'

describe('server', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('response from server', () => {
    $fetch('/api/ping',{ method:'GET' })
      .then(res => expect(res))
      .catch(err => err)
  })
})
