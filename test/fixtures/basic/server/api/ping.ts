import { defineEventHandler } from 'h3'
import { useServerSocketIo } from '#app'

export default defineEventHandler(event => {
  const socket = useServerSocketIo(event)
  socket.emit('pong', 'Response from socket.io')
  return 'pong'
})
