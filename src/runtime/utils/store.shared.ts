import { onMounted, onBeforeUnmount } from 'vue'
import { getUid } from './parse-name'

import type { Socket } from 'socket.io-client'
import type { State, Actions } from './types'

// State
export const defaults: State = {
  id: '',
  transport: undefined,
  value: new Map(),
  status: {
    active: false,
    pending: false,
    connected: false,
    error: null,
  },
}

const shared = (socket: Socket, state: State) => {
  const actions: Actions = {
    connect: () => {
      if (socket.connected) return
      state.status.pending = true
      socket.connect()
    },
    on: (event, listener, component) => {
      component = getUid(event, component)
      if (!state.value.has(event)) state.value.set(event, new Set())

      const io = socket.on(event, listener)
      state.value?.get(event)?.add(component)

      return () => {
        io?.off(event, listener)
        if (component) state.value?.get(event)?.delete(component)
      }
    },
    off: (event) => {
      socket.off(event)
      state.value.delete(event)
    },
    setup: (event, listener, component) => {
      component = getUid(event, component)
      if (!state.value.has(event)) state.value.set(event, new Set())

      onMounted(() => {
        socket.on(event, listener)
        if (component) state.value?.get(event)?.add(component)
      })
      onBeforeUnmount(() => {
        socket.off(event, listener)

        const name = state.value.get(event)
        if (component) name?.delete(component)
      })

      return () => {
        socket.off(event, listener)
        if (component) state.value?.get(event)?.delete(component)
      }
    },
    emit: (event, ...args) => socket.emit(event, ...args),
  }

  return { state, actions }
}

export default shared
