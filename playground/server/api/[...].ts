import { useSocketIO } from '#imports'

export default defineEventHandler(event => {
  const io = useSocketIO(event)
  const id = io.getId()

  console.log(`connected socket id: ${ id }`)
  if (id) io.to(id,'pong', 'Response from server')

  return 'pong'
})
