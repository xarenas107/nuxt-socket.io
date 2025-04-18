import { reactive, onMounted, onBeforeUnmount } from 'vue-demi'
import { useSocketIO, useState } from '#imports'
import { getUid } from './parseNameFromInstance'
import { configKey } from './constants'

import type { Socket } from "socket.io-client"
import type { Ref } from 'vue-demi'
import type * as Store from './types'

interface State extends Omit<Store.State, 'value'> {
  value: Ref<Store.State['value']>
}

export const store = (socket?:Socket) => {
  const io = socket || useSocketIO()

	// State
  const store = useState(`${configKey}:store`,() => new Map())
  const state = reactive<State>({
    id: io?.id,
    value: store,
    transport: undefined,
    status: {
      active: false,
      pending: false,
      connected: false,
      error: null
    }
  })

	// Actions
	const actions:Store.Actions = {
    connect: () => {
      if (io.connected) return
      state.status.pending = true
      io.connect()
    },
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
		emit: (event,...args) => io.emit(event, ...args),
	}

	return {
    ...state,
    ...actions
  }
}
