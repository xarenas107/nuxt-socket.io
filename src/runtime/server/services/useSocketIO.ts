import type { H3Event } from 'h3'
export const useSocketIO = (event:H3Event) => event.context.io
