import { useServerSocketIO } from '#imports'

export default defineEventHandler(event => {
  const socket = useServerSocketIO(event)
  socket.server.emit('pong', 'Response from socket.io')
  return 'pong'
})
