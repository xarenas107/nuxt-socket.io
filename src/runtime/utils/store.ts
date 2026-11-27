import { reactive } from 'vue'
import { useSocketIO, useState } from '#imports'
import { configKey } from './constants'
import shared, { defaults } from './store.shared'

import type { Socket } from 'socket.io-client'

export const store = (socket?: Socket) => {
  const io = socket || useSocketIO()
  const { id } = io

  const value = useState(`${configKey}:store`, () => new Map())
  const state = reactive({ ...defaults, value, id })
  const store = shared(io, state)

  return {
    ...store.state,
    ...store.actions,
  }
}
