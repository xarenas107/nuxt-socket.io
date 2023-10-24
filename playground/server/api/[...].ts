import { useServerSocketIO } from '#imports'

export default defineEventHandler(event => {
  console.log('Server route test')
  const socket = useServerSocketIO(event)
  socket.server.emit('pong', 'Response from server')
  return 'pong'
})
