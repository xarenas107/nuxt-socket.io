import { useSocketIO } from '#imports'

export default defineEventHandler(event => {
  console.log('Server route test')
  const socket = useSocketIO(event)
  socket.emit('pong', 'Response from server')
  return 'pong'
})
