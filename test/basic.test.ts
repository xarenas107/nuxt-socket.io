import { describe, it, expect } from 'vitest'
import { $fetch, url } from '@nuxt/test-utils/e2e'
import { io } from 'socket.io-client'

const ping = (transports: string[]) => new Promise<string>((resolve, reject) => {
  const socket = io(url('/'), { path: '/websocket', transports })
  const timeout = setTimeout(() => reject(new Error('timeout')), 10000)

  socket.on('connect_error', reject)
  socket.on('pong', (message: string) => {
    clearTimeout(timeout)
    socket.disconnect()
    resolve(message)
  })
  socket.on('connect', () => {
    const headers = { cookie: `io=${socket.id}` }
    $fetch('/api/ping', { headers }).catch(reject)
  })
})

describe('Socket.io', () => {
  it('Renders the app', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('basic')
  })

  const library = ['websocket', 'polling']

  it.each(library)('Emits from a server route over %s', async (transport) => {
    const promise = ping([transport])
    expect(await promise).toBe('Response from server')
  })
})
