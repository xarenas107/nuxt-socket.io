import { defineEventHandler } from 'h3'
import { useSocketIO } from '../../../../../src/runtime/server/services/useSocketIO'

export default defineEventHandler(event => {
  const socket = useSocketIO(event)
  socket.emit('pong', 'Response from socket.io')
  return 'pong'
})
