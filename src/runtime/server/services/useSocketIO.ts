import type { H3Event, SocketH3EventContext } from 'h3'

export const useSocketIO = (event:H3Event) => event.context.io as SocketH3EventContext
