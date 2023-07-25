export default defineEventHandler(event => {
  const socket = useServerSocketIo(event)
  socket.emit('pong', 'Response from socket.io')
  return 'pong'
})
