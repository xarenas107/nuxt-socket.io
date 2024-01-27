import { defineEventHandler } from 'h3'
import { useSocketIO } from '#app'

export default defineEventHandler(event => {
  const socket = useSocketIO(event)
  socket.emit('pong', 'Response from socket.io')
  return 'pong'
})
