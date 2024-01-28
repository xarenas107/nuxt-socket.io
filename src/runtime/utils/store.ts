import { useNuxtApp } from '#app'
import { reactive, getCurrentInstance } from 'vue-demi'
import type { useSocketIO } from '#imports'
import type { Socket } from "socket.io-client"

type UseSocketIOStore = (socket?:Socket) => State & Actions & { io:ReturnType<typeof useSocketIO> }
export const useSocketIOStore:UseSocketIOStore = socket => {

  const io = socket || useNuxtApp().$io

	// State
	const state = reactive<State>({
    id: io?.id ?? '',
    value: new Map()
  })

	// Actions
	const parseNameFromInstance = (event:string) => {
    const instance = getCurrentInstance()
    const regex = /.*(?:components|pages)\/|\.vue$|\/index.vue$/g
    const raw = instance?.type?.__file?.replace(regex, "")
    const _component = raw ? raw?.replaceAll('/',':') : instance?.uid?.toString() || event
    return _component
  }

  const getUid = (event:string, component?:string) => {
    return component || parseNameFromInstance(event)
  }

	const actions:Actions = {
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
    io,
    ...state,
    ...actions
  }
}

interface State {
	id:string
	value:Map<string,Set<string>>
}

interface Actions {
	setup(event: string, listener:(...args:any[]) => void,component?:string):void
	on(event: string, listener:(...args:any[]) => void,component?:string):() => void
	off(event: string):void
	emit(event:string,...args:any[]):ReturnType<typeof useSocketIO>
}
