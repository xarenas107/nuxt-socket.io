import { useSocketIO, toRefs, reactive, onMounted, onBeforeUnmount } from '#imports'
import { getUid } from './parseNameFromInstance'
import { configKey } from './constants'
import { defineStore } from 'pinia'

import type * as IOStore from './types'

export const useSocketIOStore = defineStore(configKey,() => {
	const io = useSocketIO()

	// State
	const state = reactive<IOStore.State>({
		id: io?.id ?? '',
		value: new Map(),
    transport: 'N/A',
    status: {
      pending: false,
      connected: false,
      error: null,
    }
	})

	// Actions
	const actions:IOStore.Actions = {
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
		...toRefs(state),
		...actions
	}
})
