import { defineHandler } from 'nitro/h3'

export default defineHandler((event) => {
  const io = useSocketIO(event)
  const id = io.getId()

  if (id) io.to(id, 'pong', 'Response from server')
  return 'pong'
})
