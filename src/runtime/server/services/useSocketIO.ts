import type { H3Event, SocketH3EventContext } from 'h3'

type ContextSocketIO = (event: H3Event) => SocketH3EventContext
export const useSocketIO:ContextSocketIO = (event:H3Event) => event.context.io?.server
