import { useSocketIO } from '#imports'

export default defineEventHandler(event => {
  const io = useSocketIO(event)
  console.log('Server route test')

  console.log(io?.server?.sockets?.adapter?.rooms)
  console.log(getHeader(event,'x-socket'))

  io.server.emit('pong', 'Response from server')
  return 'pong'
})
