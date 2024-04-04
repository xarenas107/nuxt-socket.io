import { defineStore } from 'pinia'
import { useSocketIO, toRefs, reactive, onMounted, onBeforeUnmount } from '#imports'
import { getUid } from './parseNameFromInstance'

import type { SocketIOStoreActions, SocketIOStoreState } from './types'

const key = 'socket.io'

export const useSocketIOStore = defineStore(key,() => {
	const io = useSocketIO()

	// State
	const state = reactive<SocketIOStoreState>({
		id: io.id ?? '',
		value: new Map()
	})

	// Actions
	const actions:SocketIOStoreActions = {
		on: (event,listener, component) => {
			component = getUid(event, component)
			if (!state.value.has(event)) state.value.set(event,new Set())

			const socket = io.on(event,listener)
			state.value?.get(event)?.add(component)

			return () => {
				socket.off(event,listener)
				if (component) state.value?.get(event)?.delete(component)
			}
		},
		off: event => {
			io.off(event)
			state.value.delete(event)
		},
		setup: (event,listener, component) => {
			component = getUid(event, component)
			if (!state.value.has(event)) state.value.set(event,new Set())

			onMounted(() => {
				io.on(event,listener)
				if (component) state.value?.get(event)?.add(component)
			})
			onBeforeUnmount(() => {
				io.off(event,listener)

				const name = state.value.get(event)
				if (component) name?.delete(component)
			})
		},
		emit: (event,...args) => io.emit(event, ...args),
	}

	return {
		...toRefs(state),
		...actions
	}
})
