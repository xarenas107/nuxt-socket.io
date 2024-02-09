import type { H3Event } from 'h3'
import type { H3SocketContext } from '../../../types'

export const useSocketIO = (event:H3Event) => event.context.io as H3SocketContext
