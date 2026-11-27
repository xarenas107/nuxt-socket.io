import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, $fetch, url } from '@nuxt/test-utils/e2e'
import { io } from 'socket.io-client'

const pingOver = (transports: string[]) => new Promise<string>((resolve, reject) => {
  const socket = io(url('/'), { path: '/websocket', transports })
  const timeout = setTimeout(() => reject(new Error('timeout')), 10_000)

  socket.on('connect_error', reject)
  socket.on('pong', (message: string) => {
    clearTimeout(timeout)
    socket.disconnect()
    resolve(message)
  })
  socket.on('connect', () => {
    $fetch('/api/ping', { headers: { cookie: `io=${socket.id}` } }).catch(reject)
  })
})

describe('socket.io', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
    dev: true,
    nuxtConfig: {
      test: true,
      compatibilityDate: 'latest',
    },
  })

  it('renders the app', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('basic')
  })

  it.each([
    ['websocket'],
    ['polling'],
  ])('emits from a server route over %s', async (transport) => {
    expect(await pingOver([transport])).toBe('Response from server')
  })
})
