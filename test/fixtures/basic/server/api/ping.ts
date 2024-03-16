import { defineEventHandler } from 'h3'
import { useSocketIO } from '../../../../../src/runtime/server/services/useSocketIO'

export default defineEventHandler(event => {
  const io = useSocketIO(event)
  const id = io.getId()

  if (id) io.to(id,'pong', 'Response from server')
  return 'pong'
})
