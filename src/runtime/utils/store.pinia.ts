import { defineStore } from 'pinia'
import { reactive, getCurrentInstance, onMounted, onBeforeUnmount } from 'vue-demi'
import { useSocketIO } from '#imports'
import { toRefs } from '#imports'

const key = 'socket.io'

export const useSocketIOStore = defineStore(key,() => {
	const io = useSocketIO()

	// State
	const state = reactive<State>({
		id: io.id ?? '',
		value: new Map()
	})

	// Actions
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
		...toRefs(state),
		...actions
	}
})

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
