import { useSocketIO, useRuntimeConfig } from '#imports'

export default defineEventHandler(event => {
  const runtime = useRuntimeConfig()
  const io = useSocketIO(event)
  const id = io.getId()

  console.log({
    private: runtime.io,
    public: runtime.public.io
  })

  if (id) io.to(id, 'pong', 'Response from server')
  return 'pong'
})
