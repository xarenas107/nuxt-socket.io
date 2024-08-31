import { reactive, onMounted, onBeforeUnmount } from 'vue-demi'
import { useSocketIO, useState } from '#imports'
import { getUid } from './parseNameFromInstance'
import { configKey } from './constants'

import type { Socket } from "socket.io-client"
import type { SocketIOStoreActions, SocketIOStoreState } from './types'

export const useSocketIOStore = (socket?:Socket) => {
  const io = socket || useSocketIO()

	// State
  const store = useState<SocketIOStoreState['value']>(`${configKey}:store`,() => new Map())

  const state = reactive({
    id: io?.id ?? '',
    value: store,
    transport: 'N/A',
    status: {
      pending: false,
      connected: false
    }
  })

	// Actions

	const actions:SocketIOStoreActions = {
		on: (event, listener, component) => {
			component = getUid(event, component)
			if (!state.value.has(event)) state.value.set(event,new Set())

			const socket = io.on(event,listener)
			state.value?.get(event)?.add(component)

			return () => {
				socket.off(event, listener)
				if (component) state.value?.get(event)?.delete(component)
			}
		},
		off: event => {
			io.off(event)
			state.value.delete(event)
		},
		setup: (event, listener, component) => {
			component = getUid(event, component)
			if (!state.value.has(event)) state.value.set(event,new Set())

			onMounted(() => {
				io.on(event, listener)
				if (component) state.value?.get(event)?.add(component)
			})
			onBeforeUnmount(() => {
				io.off(event, listener)

				const name = state.value.get(event)
				if (component) name?.delete(component)
			})

      return () => {
				io.off(event, listener)
				if (component) state.value?.get(event)?.delete(component)
			}
		},
		emit: (event,...args) => {
      state.status.pending = true
      return io.emit(event, ...args, () => {
        state.status.pending = false
      })
    },
	}

	return {
    $io: io,
    ...state,
    ...actions
  }
}
