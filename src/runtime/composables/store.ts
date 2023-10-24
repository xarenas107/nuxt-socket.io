import type { Socket } from 'socket.io-client'

const key = 'socket.io'
export const useSocketIOStore = () => {
	const io = useSocketIO()

	// State
	const state = useState<State>(key,() => new Map())

	// Actions
	const parseNameFromInstance = () => {
		const instance = getCurrentInstance()
		const regex = /.*(?:components|pages)\/|\.vue$|\/index.vue$/g
		const raw = instance?.type?.__file?.replace(regex, "")
		return raw?.replaceAll('/',':')
	}
	const getUid = (event?:string, component?:string) => {
		return component ?? parseNameFromInstance() ?? event
	}

	const actions:Actions = {
		on: (event,listener, component) => {
			component = getUid(event, component)
			if (!state.value.has(event)) state.value.set(event,new Map)
			if (state.value.get(event)?.has(component)) return

			const socket = io.on(event,listener)
			state.value?.get(event)?.set(component,socket)
		},
		off: (event,component) => {
			component = getUid(event, component)
			if (!state.value?.has(event)) return
			component ? state.value.get(event)?.delete(component) : state.value.delete(event)
		}
	}

	return { state, ...actions }
}

type State = Map<string,Map<string,Socket>>

interface Actions {
	on(event: string, listener:(...args:any[]) => void,component?:any):void
	off(event: string, component?:any):void
}
